const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    items: {
        engineOilLevel: { type: Boolean, default: false },
        brakeCheck: { type: Boolean, default: false },
        tyreCondition: { type: Boolean, default: false },
        drumRotation: { type: Boolean, default: false },
        waterSystem: { type: Boolean, default: false },
        lightsHorn: { type: Boolean, default: false }
    },
    odometerReading: {
        type: Number
    },
    engineHoursReading: {
        type: Number
    },
    remarks: {
        type: String,
        trim: true
    },
    allChecked: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Check if all items are checked
checklistSchema.pre('save', function (next) {
    const items = this.items;
    this.allChecked = items.engineOilLevel && items.brakeCheck &&
        items.tyreCondition && items.drumRotation &&
        items.waterSystem && items.lightsHorn;
    next();
});

// Create compound index to ensure one checklist per vehicle per day
checklistSchema.index({ vehicle: 1, date: 1 }, { 
    unique: true,
    partialFilterExpression: {
        date: { $type: "date" }
    }
});

module.exports = mongoose.model('Checklist', checklistSchema);
