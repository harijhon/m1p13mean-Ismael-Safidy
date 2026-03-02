import mongoose from 'mongoose';

const boxSchema = new mongoose.Schema({
    boxNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    floor: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    currentStore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null
    }
}, {
    timestamps: true,
});

const Box = mongoose.model('Box', boxSchema);

export default Box;
