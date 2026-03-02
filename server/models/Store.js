import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['CREATED', 'VALIDATED', 'PRE_NOTICE', 'WITHDRAWN'],
    default: 'CREATED'
  },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now }
  }],
  evictionDate: {
    type: Date
  },
  evictionReason: {
    type: String
  },
  rentContract: {
    boxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Box' },
    requestedBoxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Box' }, // Specific Box requested by Manager
    monthlyAmount: Number,
    paymentDueDate: { type: Number, default: 5 }
  }
}, {
  timestamps: true,
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
