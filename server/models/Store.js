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
}, {
  timestamps: true,
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
