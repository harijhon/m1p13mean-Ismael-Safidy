import mongoose from 'mongoose';

const mouvementStockSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['entree', 'sortie'],
        required: true
    },
    quantite: {
        type: Number,
        required: true
    },
    pu: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    reste: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('MouvementStock', mouvementStockSchema);
