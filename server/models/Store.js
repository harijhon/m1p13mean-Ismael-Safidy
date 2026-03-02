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
    enum: ['ACTIVE', 'INACTIVE', 'EVICTION_NOTICE'],
    default: 'ACTIVE'
  },
  evictionReason: {
    type: String
  },
  rentContract: {
    boxNumber: String,
    monthlyAmount: Number,
    paymentDueDate: { type: Number, default: 5 }
  }
}, {
  timestamps: true,
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
