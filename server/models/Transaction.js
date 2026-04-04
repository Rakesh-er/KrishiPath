import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    batchId: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETH' },
    blockchainTxHash: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['payment', 'reward', 'penalty', 'batch_creation'],
        default: 'payment'
    },
    metadata: {
        gasUsed: String,
        gasPrice: String,
        blockNumber: Number
    }
}, {
    timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
