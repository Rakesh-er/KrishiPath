const mongoose = require('mongoose');

const produceBatchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    produceName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }, // kg, tons, etc.
    harvestDate: { type: Date, required: true },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    status: {
        type: String,
        enum: ['harvested', 'in_transit', 'at_retailer', 'sold', 'expired'],
        default: 'harvested'
    },
    qrCode: { type: String, required: true },
    blockchainTxHash: { type: String },
    quality: {
        grade: { type: String, enum: ['A', 'B', 'C'] },
        certifications: [String],
        testResults: {
            pesticides: Boolean,
            organicCertified: Boolean,
            qualityScore: Number
        }
    },
    currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pricePerUnit: { type: Number },
    timeline: [{
        status: String,
        timestamp: Date,
        handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        location: String,
        notes: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ProduceBatch', produceBatchSchema);