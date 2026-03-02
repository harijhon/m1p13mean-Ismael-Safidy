import mongoose from 'mongoose';

const rentInvoiceSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    month: {
        type: Date,
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

rentInvoiceSchema.virtual('balance').get(function () {
    return (this.amountDue || 0) - (this.amountPaid || 0);
});

// CRITIQUE (Idempotence) : Index composé unique
rentInvoiceSchema.index({ store: 1, month: 1 }, { unique: true });

const RentInvoice = mongoose.model('RentInvoice', rentInvoiceSchema);

export default RentInvoice;
