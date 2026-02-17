import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT', 'ADJUSTMENT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reason: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('InventoryLog', inventoryLogSchema);