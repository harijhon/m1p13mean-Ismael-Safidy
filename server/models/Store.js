import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settings: {
        type: Object
    }
}, {
    timestamps: true
});

export default mongoose.model('Store', storeSchema);