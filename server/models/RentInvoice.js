import mongoose from 'mongoose';

const rentInvoiceSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    period: {
        type: String,
        required: true
    },
    amountDue: {
        type: Number
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'PARTIAL', 'LATE'],
        default: 'PENDING'
    },
    history: [{
        date: { type: Date, default: Date.now },
        amount: Number,
        note: String
    }]
}, {
    timestamps: true
});

// CRITIQUE (Idempotence) : Index composé unique
rentInvoiceSchema.index({ store: 1, period: 1 }, { unique: true });

const RentInvoice = mongoose.model('RentInvoice', rentInvoiceSchema);

export default RentInvoice;
