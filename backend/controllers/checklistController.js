const Checklist = require('../models/Checklist');

// @desc    Get all checklists
// @route   GET /api/checklists
exports.getChecklists = async (req, res) => {
    try {
        const { vehicleId, driverId, date } = req.query;
        let query = { owner: req.user.id };

        if (vehicleId) query.vehicle = vehicleId;
        if (driverId) query.driver = driverId;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const checklists = await Checklist.find(query)
            .populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: checklists.length,
            data: checklists
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get today's checklist for driver
// @route   GET /api/checklists/today
exports.getTodayChecklist = async (req, res) => {
    try {
        const { vehicleId, driverId } = req.query;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const checklist = await Checklist.findOne({
            vehicle: vehicleId,
            driver: driverId,
            date: { $gte: today, $lt: tomorrow }
        }).populate('vehicle', 'vehicleNumber model');

        res.status(200).json({
            success: true,
            data: checklist
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single checklist
// @route   GET /api/checklists/:id
exports.getChecklist = async (req, res) => {
    try {
        const checklist = await Checklist.findById(req.params.id)
            .populate('vehicle', 'vehicleNumber model')
            .populate('driver', 'name mobile');

        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found'
            });
        }

        res.status(200).json({
            success: true,
            data: checklist
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create checklist
// @route   POST /api/checklists
exports.createChecklist = async (req, res) => {
    try {
        const { vehicle, driver } = req.body;

        // Check if vehicle is provided
        if (!vehicle) {
            return res.status(400).json({
                success: false,
                message: 'You do not have an assigned vehicle. Please contact your fleet manager to assign a vehicle before submitting checklists.',
                noVehicle: true
            });
        }

        // Check if checklist already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingChecklist = await Checklist.findOne({
            vehicle: vehicle,
            driver: driver,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existingChecklist) {
            return res.status(400).json({
                success: false,
                message: 'Checklist already completed for today. You can submit again tomorrow.',
                alreadyCompleted: true,
                existingChecklist: existingChecklist
            });
        }

        req.body.owner = req.user.id;
        req.body.date = new Date();
        req.body.submittedAt = new Date();
        req.body.allChecked = Object.values(req.body.items || {}).every(v => v === true);

        const checklist = await Checklist.create(req.body);

        const populatedChecklist = await Checklist.findById(checklist._id)
            .populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name');

        res.status(201).json({
            success: true,
            data: populatedChecklist
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update checklist
// @route   PUT /api/checklists/:id
exports.updateChecklist = async (req, res) => {
    try {
        let checklist = await Checklist.findById(req.params.id);

        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found'
            });
        }

        checklist = await Checklist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name');

        res.status(200).json({
            success: true,
            data: checklist
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete checklist
// @route   DELETE /api/checklists/:id
exports.deleteChecklist = async (req, res) => {
    try {
        const checklist = await Checklist.findById(req.params.id);

        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found'
            });
        }

        await checklist.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
