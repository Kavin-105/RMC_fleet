const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: [true, 'Please provide vehicle number'],
        unique: true,
        trim: true,
        uppercase: true
    },
    chassisNumber: {
        type: String,
        required: [true, 'Please provide chassis number'],
        unique: true,
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Please provide model'],
        trim: true
    },
    manufacturingYear: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        default: 'Diesel'
    },
    drumCapacity: {
        type: Number,
        required: [true, 'Please provide drum capacity']
    },
    registrationDate: {
        type: Date,
        required: true
    },
    currentOdometer: {
        type: Number,
        default: 0
    },
    engineHours: {
        type: Number,
        default: 0
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Maintenance', 'Inactive'],
        default: 'Active'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
