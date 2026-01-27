const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide driver name'],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Please provide mobile number'],
        unique: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'Please provide license number'],
        unique: true,
        trim: true
    },
    licenseExpiry: {
        type: Date,
        required: [true, 'Please provide license expiry date']
    },
    assignedVehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    checklistCompliance: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
