import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import ProduceBatch from '../models/ProduceBatch.js';
import User from '../models/User.js';
import Reward from '../models/Reward.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authMiddleware, roleMiddleware(['farmer']), async (req, res) => {
    try {
        const {
            produceName,
            quantity,
            unit,
            harvestDate,
            location,
            quality,
            pricePerUnit
        } = req.body;

        const batchId = `BATCH-${Date.now()}-${uuidv4().slice(0, 8)}`;

        const qrData = {
            batchId,
            produceName,
            farmerId: req.user.id,
            harvestDate,
            verificationUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${batchId}`
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

        const loc = location || {};
        const timelineLocation = typeof loc === 'object' && loc.address != null
            ? String(loc.address)
            : '';

        const produceBatch = new ProduceBatch({
            batchId,
            farmerId: req.user.id,
            produceName,
            quantity: Number(quantity),
            unit,
            harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
            location: {
                latitude: loc.latitude != null && loc.latitude !== '' ? Number(loc.latitude) : undefined,
                longitude: loc.longitude != null && loc.longitude !== '' ? Number(loc.longitude) : undefined,
                address: loc.address
            },
            quality: quality || {
                grade: 'B',
                testResults: { pesticides: false, organicCertified: false, qualityScore: 70 }
            },
            qrCode,
            currentHolder: req.user.id,
            pricePerUnit: pricePerUnit !== '' && pricePerUnit != null ? Number(pricePerUnit) : undefined,
            timeline: [{
                status: 'harvested',
                timestamp: new Date(),
                handledBy: req.user.id,
                location: timelineLocation,
                notes: 'Produce harvested and batch created'
            }]
        });

        await produceBatch.save();

        const reward = new Reward({
            userId: req.user.id,
            points: 10,
            reason: 'New produce batch created',
            batchId
        });
        await reward.save();

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { rewardPoints: 10 }
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('produceUpdated', {
                action: 'created',
                batch: produceBatch
            });
        }

        res.status(201).json({
            message: 'Produce batch created successfully',
            batchId,
            qrCode,
            batch: produceBatch
        });
    } catch (error) {
        console.error('Produce add error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/update/:batchId', authMiddleware, async (req, res) => {
    try {
        const { batchId } = req.params;
        const { status, location, notes } = req.body;

        const batch = await ProduceBatch.findOne({ batchId });
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        const allowedRoles = {
            in_transit: ['farmer', 'transporter'],
            at_retailer: ['transporter', 'retailer'],
            sold: ['retailer'],
            expired: ['government', 'retailer']
        };

        if (!status || !allowedRoles[status] || !allowedRoles[status].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this status update' });
        }

        batch.status = status;
        if (status === 'in_transit' || status === 'at_retailer') {
            batch.currentHolder = req.user.id;
        }

        batch.timeline.push({
            status,
            timestamp: new Date(),
            handledBy: req.user.id,
            location: location ?? '',
            notes: notes ?? ''
        });

        await batch.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('produceUpdated', {
                action: 'updated',
                batch,
                updatedBy: req.user.id
            });
        }

        res.json({
            message: 'Batch status updated successfully',
            batch
        });
    } catch (error) {
        console.error('Produce update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/list', authMiddleware, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'farmer') {
            query.farmerId = req.user.id;
        } else if (req.user.role === 'transporter' || req.user.role === 'retailer') {
            query.currentHolder = req.user.id;
        }

        const batches = await ProduceBatch.find(query)
            .populate('farmerId', 'name email')
            .populate('currentHolder', 'name email role')
            .sort({ createdAt: -1 });

        res.json(batches);
    } catch (error) {
        console.error('Produce list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await ProduceBatch.findOne({ batchId })
            .populate('farmerId', 'name email address')
            .populate('currentHolder', 'name email role')
            .populate('timeline.handledBy', 'name role');

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        res.json(batch);
    } catch (error) {
        console.error('Produce get error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
