const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    type: {
        type: String,
        required: [true, 'Please provide document type'],
        enum: ['RC Book', 'Insurance', 'Fitness', 'Permit', 'Pollution', 'Service']
    },
    fileUrl: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please provide expiry date']
    },
    status: {
        type: String,
        enum: ['Valid', 'Expiring', 'Expired'],
        default: 'Valid'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Update status based on expiry date
documentSchema.pre('save', function (next) {
    const today = new Date();
    const expiryDate = new Date(this.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
        this.status = 'Expired';
    } else if (daysUntilExpiry <= 30) {
        this.status = 'Expiring';
    } else {
        this.status = 'Valid';
    }
    next();
});

module.exports = mongoose.model('Document', documentSchema);
