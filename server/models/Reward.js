const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    reason: { type: String, required: true },
    batchId: { type: String },
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);