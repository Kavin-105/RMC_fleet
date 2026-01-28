const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    type: {
        type: String,
        required: [true, 'Please provide expense type'],
        enum: ['Fuel', 'Maintenance', 'Toll', 'Spare Parts', 'Other']
    },
    amount: {
        type: Number,
        required: [true, 'Please provide amount']
    },
    description: {
        type: String,
        trim: true
    },
    billPhoto: {
        type: String,
        default: null
    },
    billPhotoContentType: {
        type: String,
        default: null
    },
    billPhotoName: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
    location: {
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
