const express = require('express');
const { ethers } = require('ethers');
const Transaction = require('../models/Transaction');
const ProduceBatch = require('../models/ProduceBatch');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Smart contract ABI (simplified)
const contractABI = [
    "function createBatch(string memory batchId, address farmer, uint256 timestamp, uint8 quality) public",
    "function updateBatchStatus(string memory batchId, uint8 status, uint256 timestamp) public",
    "function releaseFarmerPayment(string memory batchId, address farmer, uint256 amount) public payable",
    "event BatchCreated(string batchId, address farmer, uint256 timestamp)",
    "event BatchUpdated(string batchId, uint8 status, uint256 timestamp)",
    "event PaymentReleased(string batchId, address farmer, uint256 amount)"
];

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
    process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
    contractABI,
    wallet
);

// Create blockchain transaction for batch
router.post('/create-batch', authMiddleware, async (req, res) => {
    try {
        const { batchId } = req.body;

        const batch = await ProduceBatch.findOne({ batchId }).populate('farmerId');
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Create blockchain transaction
        const tx = await contract.createBatch(
            batchId,
            batch.farmerId.walletAddress || wallet.address,
            Math.floor(Date.now() / 1000),
            batch.quality.grade === 'A' ? 3 : batch.quality.grade === 'B' ? 2 : 1
        );

        // Save transaction record
        const transaction = new Transaction({
            batchId,
            from: req.user.id,
            to: batch.farmerId._id,
            amount: 0, // No payment for batch creation
            blockchainTxHash: tx.hash,
            status: 'pending',
            type: 'batch_creation'
        });

        await transaction.save();

        // Update batch with transaction hash
        batch.blockchainTxHash = tx.hash;
        await batch.save();

        // Wait for confirmation
        const receipt = await tx.wait();

        transaction.status = 'confirmed';
        transaction.metadata = {
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: tx.gasPrice.toString(),
            blockNumber: receipt.blockNumber
        };
        await transaction.save();

        // Emit real-time event
        const io = req.app.get('io');
        io.emit('transactionConfirmed', {
            batchId,
            txHash: tx.hash,
            status: 'confirmed'
        });

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

// Release payment to farmer
router.post('/release-payment', authMiddleware, async (req, res) => {
    try {
        const { batchId, amount } = req.body;

        const batch = await ProduceBatch.findOne({ batchId }).populate('farmerId');
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Only retailers can release payments
        if (req.user.role !== 'retailer') {
            return res.status(403).json({ message: 'Only retailers can release payments' });
        }

        const amountWei = ethers.parseEther(amount.toString());

        const tx = await contract.releaseFarmerPayment(
            batchId,
            batch.farmerId.walletAddress || wallet.address,
            amountWei,
            { value: amountWei }
        );

        const transaction = new Transaction({
            batchId,
            from: req.user.id,
            to: batch.farmerId._id,
            amount,
            blockchainTxHash: tx.hash,
            status: 'pending'
        });

        await transaction.save();

        const receipt = await tx.wait();

        transaction.status = 'confirmed';
        transaction.metadata = {
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: tx.gasPrice.toString(),
            blockNumber: receipt.blockNumber
        };
        await transaction.save();

        const io = req.app.get('io');
        io.emit('transactionConfirmed', {
            batchId,
            txHash: tx.hash,
            amount,
            to: batch.farmerId.name
        });

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

// Get transaction history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ from: req.user.id }, { to: req.user.id }]
        }).populate('from to', 'name email role').sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;