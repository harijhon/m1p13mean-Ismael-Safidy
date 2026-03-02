import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['BOX_REQUEST', 'STORE_VALIDATED', 'PRE_NOTICE_ALERT', 'GENERAL'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedStore: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
