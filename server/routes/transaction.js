import express from 'express';
import { ethers } from 'ethers';
import Transaction from '../models/Transaction.js';
import ProduceBatch from '../models/ProduceBatch.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const contractABI = [
    'function createBatch(string memory batchId, address farmer, uint256 timestamp, uint8 quality) public',
    'function updateBatchStatus(string memory batchId, uint8 status, uint256 timestamp) public',
    'function releaseFarmerPayment(string memory batchId, address farmer, uint256 amount) public payable',
    'event BatchCreated(string batchId, address farmer, uint256 timestamp)',
    'event BatchUpdated(string batchId, uint8 status, uint256 timestamp)',
    'event PaymentReleased(string batchId, address farmer, uint256 amount)'
];

let blockchain = null;

function getBlockchain() {
    if (blockchain?.disabled) return blockchain;
    if (blockchain?.contract) return blockchain;

    const rpc = process.env.BLOCKCHAIN_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

    if (!rpc || !pk || !contractAddress) {
        blockchain = { disabled: true, reason: 'Blockchain env vars not set' };
        return blockchain;
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpc);
        const wallet = new ethers.Wallet(pk, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        blockchain = { contract, wallet, provider };
        return blockchain;
    } catch (err) {
        console.error('Blockchain init failed:', err.message);
        blockchain = { disabled: true, reason: err.message };
        return blockchain;
    }
}

router.post('/create-batch', authMiddleware, async (req, res) => {
    try {
        const bc = getBlockchain();
        if (!bc.contract) {
            return res.status(503).json({
                message: 'Blockchain not configured or unavailable',
                detail: bc.reason || bc.disabled
            });
        }

        const { batchId } = req.body;
        const batch = await ProduceBatch.findOne({ batchId }).populate('farmerId');
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        const grade = batch.quality?.grade;
        const qualityVal = grade === 'A' ? 3 : grade === 'B' ? 2 : 1;

        const tx = await bc.contract.createBatch(
            batchId,
            batch.farmerId.walletAddress || bc.wallet.address,
            Math.floor(Date.now() / 1000),
            qualityVal
        );

        const transaction = new Transaction({
            batchId,
            from: req.user.id,
            to: batch.farmerId._id,
            amount: 0,
            blockchainTxHash: tx.hash,
            status: 'pending',
            type: 'batch_creation'
        });

        await transaction.save();

        batch.blockchainTxHash = tx.hash;
        await batch.save();

        const receipt = await tx.wait();

        transaction.status = 'confirmed';
        transaction.metadata = {
            gasUsed: receipt.gasUsed != null ? String(receipt.gasUsed) : undefined,
            gasPrice: tx.gasPrice != null ? String(tx.gasPrice) : undefined,
            blockNumber: receipt.blockNumber
        };
        await transaction.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('transactionConfirmed', {
                batchId,
                txHash: tx.hash,
                status: 'confirmed'
            });
        }

        res.json({
            message: 'Batch created on blockchain',
            txHash: tx.hash,
            transaction
        });
    } catch (error) {
        console.error('Blockchain error:', error);
        res.status(500).json({ message: 'Blockchain transaction failed', error: error.message });
    }
});

router.post('/release-payment', authMiddleware, async (req, res) => {
    try {
        const bc = getBlockchain();
        if (!bc.contract) {
            return res.status(503).json({
                message: 'Blockchain not configured or unavailable',
                detail: bc.reason || bc.disabled
            });
        }

        const { batchId, amount } = req.body;

        if (amount == null || Number(amount) <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }

        const batch = await ProduceBatch.findOne({ batchId }).populate('farmerId');
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        if (req.user.role !== 'retailer') {
            return res.status(403).json({ message: 'Only retailers can release payments' });
        }

        const amountWei = ethers.parseEther(String(amount));

        const tx = await bc.contract.releaseFarmerPayment(
            batchId,
            batch.farmerId.walletAddress || bc.wallet.address,
            amountWei,
            { value: amountWei }
        );

        const transaction = new Transaction({
            batchId,
            from: req.user.id,
            to: batch.farmerId._id,
            amount: Number(amount),
            blockchainTxHash: tx.hash,
            status: 'pending',
            type: 'payment'
        });

        await transaction.save();

        const receipt = await tx.wait();

        transaction.status = 'confirmed';
        transaction.metadata = {
            gasUsed: receipt.gasUsed != null ? String(receipt.gasUsed) : undefined,
            gasPrice: tx.gasPrice != null ? String(tx.gasPrice) : undefined,
            blockNumber: receipt.blockNumber
        };
        await transaction.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('transactionConfirmed', {
                batchId,
                txHash: tx.hash,
                amount,
                to: batch.farmerId.name
            });
        }

        res.json({
            message: 'Payment released successfully',
            txHash: tx.hash,
            transaction
        });
    } catch (error) {
        console.error('Payment release error:', error);
        res.status(500).json({ message: 'Payment release failed', error: error.message });
    }
});

router.get('/history', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ from: req.user.id }, { to: req.user.id }]
        }).populate('from to', 'name email role').sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
