import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    sku: {
        type: String
    },
    attributes: {
        type: Map,
        of: String
    },
    price: {
        type: Number
    },
    stock: {
        type: Number
    }
});

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
    hasVariants: {
        type: Boolean,
        default: false
    },
    variants: [variantSchema],
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