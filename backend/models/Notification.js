const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['document_expiring', 'document_expired', 'license_expiring', 'license_expired', 'engine_prediction', 'general'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // Reference to the related document (if applicable)
    relatedDocument: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null
    },
    // Reference to the related vehicle (if applicable)
    relatedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    // Whether notification has been read
    isRead: {
        type: Boolean,
        default: false
    },
    // Whether email was sent for this notification
    emailSent: {
        type: Boolean,
        default: false
    },
    // Severity level for UI display
    severity: {
        type: String,
        enum: ['info', 'warning', 'error', 'success'],
        default: 'info'
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
