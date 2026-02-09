import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    name: {
        type: String
    },
    type: {
        type: String,
        enum: ['PRODUCT', 'SERVICE']
    },
    price: {
        type: Number
    },
    costPrice: {
        type: Number
    },
    currentStock: {
        type: Number,
        default: 0
    },
    images: [{
        type: String
    }],
    isActive: {
        type: Boolean
    }
}, {
    timestamps: true
});

export default mongoose.model('Product', productSchema);