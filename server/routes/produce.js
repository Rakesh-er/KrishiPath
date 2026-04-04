const express = require('express');
const QRCode = require('qrcode');
const ProduceBatch = require('../models/ProduceBatch');
const User = require('../models/User');
const Reward = require('../models/Reward');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Add new produce batch (Farmer only)
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

        const batchId = `BATCH-${Date.now()}-${uuidv4().substr(0, 8)}`;

        // Generate QR Code
        const qrData = {
            batchId,
            produceName,
            farmerId: req.user.id,
            harvestDate,
            verificationUrl: `${process.env.CLIENT_URL}/verify/${batchId}`
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

        const produceBatch = new ProduceBatch({
            batchId,
            farmerId: req.user.id,
            produceName,
            quantity,
            unit,
            harvestDate,
            location,
            quality,
            qrCode,
            currentHolder: req.user.id,
            pricePerUnit,
            timeline: [{
                status: 'harvested',
                timestamp: new Date(),
                handledBy: req.user.id,
                location: location.address,
                notes: 'Produce harvested and batch created'
            }]
        });

        await produceBatch.save();

        // Award points to farmer
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

        // Emit real-time event
        const io = req.app.get('io');
        io.emit('produceUpdated', {
            action: 'created',
            batch: produceBatch
        });

        res.status(201).json({
            message: 'Produce batch created successfully',
            batchId,
            qrCode,
            batch: produceBatch
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update batch status
router.put('/update/:batchId', authMiddleware, async (req, res) => {
    try {
        const { batchId } = req.params;
        const { status, location, notes } = req.body;

        const batch = await ProduceBatch.findOne({ batchId });
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        // Check authorization
        const allowedRoles = {
            'in_transit': ['farmer', 'transporter'],
            'at_retailer': ['transporter', 'retailer'],
            'sold': ['retailer'],
            'expired': ['government', 'retailer']
        };

        if (!allowedRoles[status] || !allowedRoles[status].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this status update' });
        }

        // Update batch
        batch.status = status;
        if (status === 'in_transit' || status === 'at_retailer') {
            batch.currentHolder = req.user.id;
        }

        batch.timeline.push({
            status,
            timestamp: new Date(),
            handledBy: req.user.id,
            location,
            notes
        });

        await batch.save();

        // Emit real-time event
        const io = req.app.get('io');
        io.emit('produceUpdated', {
            action: 'updated',
            batch,
            updatedBy: req.user.id
        });

        res.json({
            message: 'Batch status updated successfully',
            batch
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all batches (filtered by user role)
router.get('/list', authMiddleware, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'farmer') {
            query.farmerId = req.user.id;
        } else if (req.user.role === 'transporter' || req.user.role === 'retailer') {
            query.currentHolder = req.user.id;
        }
        // Government can see all

        const batches = await ProduceBatch.find(query)
            .populate('farmerId', 'name email')
            .populate('currentHolder', 'name email role')
            .sort({ createdAt: -1 });

        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get batch details by ID
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
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;