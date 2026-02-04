const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');
const Document = require('../models/Document');
const Checklist = require('../models/Checklist');

// @desc    Get all vehicles
// @route   GET /api/vehicles
exports.getVehicles = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { owner: req.user.id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { vehicleNumber: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(query)
            .populate('assignedDriver', 'name mobile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('assignedDriver', 'name mobile licenseNumber');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
exports.createVehicle = async (req, res) => {
    try {
        const Driver = require('../models/Driver');

        // Convert empty string to null for assignedDriver
        if (req.body.assignedDriver === '' || req.body.assignedDriver === undefined) {
            req.body.assignedDriver = null;
        }

        // Check if driver is already assigned to another vehicle
        if (req.body.assignedDriver) {
            const existingVehicle = await Vehicle.findOne({
                assignedDriver: req.body.assignedDriver
            });

            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: `This driver is already assigned to vehicle ${existingVehicle.vehicleNumber}. A driver can only be assigned to one vehicle at a time.`,
                    conflictVehicle: existingVehicle.vehicleNumber
                });
            }
        }

        req.body.owner = req.user.id;
        const vehicle = await Vehicle.create(req.body);

        // If vehicle is created with an assigned driver, add to driver's assignedVehicles
        if (req.body.assignedDriver) {
            await Driver.findByIdAndUpdate(
                req.body.assignedDriver,
                { $addToSet: { assignedVehicles: vehicle._id } }
            );
        }

        res.status(201).json({
            success: true,
            data: vehicle
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
    try {
        const Driver = require('../models/Driver');
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Make sure user owns vehicle
        if (vehicle.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this vehicle'
            });
        }

        // Convert empty string to null for assignedDriver
        if (req.body.assignedDriver === '') {
            req.body.assignedDriver = null;
        }

        // If assignedDriver is being updated, sync with driver's assignedVehicles
        if (req.body.assignedDriver !== undefined) {
            const previousDriverId = vehicle.assignedDriver;
            const newDriverId = req.body.assignedDriver;

            // Check if new driver is already assigned to another vehicle
            if (newDriverId && (!previousDriverId || previousDriverId.toString() !== newDriverId)) {
                const existingVehicle = await Vehicle.findOne({
                    assignedDriver: newDriverId,
                    _id: { $ne: req.params.id } // Exclude current vehicle
                });

                if (existingVehicle) {
                    return res.status(400).json({
                        success: false,
                        message: `This driver is already assigned to vehicle ${existingVehicle.vehicleNumber}. A driver can only be assigned to one vehicle at a time.`,
                        conflictVehicle: existingVehicle.vehicleNumber
                    });
                }
            }

            // Remove from previous driver
            if (previousDriverId && previousDriverId.toString() !== newDriverId) {
                await Driver.findByIdAndUpdate(
                    previousDriverId,
                    { $pull: { assignedVehicles: vehicle._id } }
                );
            }

            // Add to new driver
            if (newDriverId) {
                await Driver.findByIdAndUpdate(
                    newDriverId,
                    { $addToSet: { assignedVehicles: vehicle._id } }
                );
            }
        }

        vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('assignedDriver', 'name mobile');

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this vehicle'
            });
        }

        await vehicle.deleteOne();

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

// @desc    Assign driver to vehicle
// @route   PUT /api/vehicles/:id/assign-driver
exports.assignDriver = async (req, res) => {
    try {
        const { driverId } = req.body;
        const Driver = require('../models/Driver');

        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Check if driver is already assigned to another vehicle
        if (driverId) {
            const existingVehicle = await Vehicle.findOne({
                assignedDriver: driverId,
                _id: { $ne: req.params.id } // Exclude current vehicle
            });

            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: `This driver is already assigned to vehicle ${existingVehicle.vehicleNumber}. A driver can only be assigned to one vehicle at a time.`,
                    conflictVehicle: existingVehicle.vehicleNumber
                });
            }
        }

        // Get the previous driver ID before updating
        const previousDriverId = vehicle.assignedDriver;

        // If there was a previous driver, remove this vehicle from their assignedVehicles
        if (previousDriverId) {
            await Driver.findByIdAndUpdate(
                previousDriverId,
                { $pull: { assignedVehicles: vehicle._id } }
            );
        }

        // Update vehicle with new driver
        vehicle.assignedDriver = driverId || null;
        await vehicle.save();

        // If there's a new driver, add this vehicle to their assignedVehicles
        if (driverId) {
            await Driver.findByIdAndUpdate(
                driverId,
                { $addToSet: { assignedVehicles: vehicle._id } }
            );
        }

        vehicle = await Vehicle.findById(req.params.id)
            .populate('assignedDriver', 'name mobile');

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get vehicle details with expenses, documents, checklists
// @route   GET /api/vehicles/:id/details
exports.getVehicleDetails = async (req, res) => {
    try {
        const vehicleId = req.params.id;

        // Get vehicle info
        const vehicle = await Vehicle.findById(vehicleId)
            .populate('assignedDriver', 'name mobile licenseNumber');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Get expenses for this vehicle
        const expenses = await Expense.find({ vehicle: vehicleId })
            .populate('driver', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get documents for this vehicle
        const documents = await Document.find({ vehicle: vehicleId })
            .sort({ expiryDate: 1 });

        // Get recent checklists for this vehicle (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const checklists = await Checklist.find({
            vehicle: vehicleId,
            date: { $gte: sevenDaysAgo }
        })
            .populate('driver', 'name')
            .sort({ date: -1 });

        // Check today's checklist status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayChecklist = await Checklist.findOne({
            vehicle: vehicleId,
            date: { $gte: today, $lt: tomorrow }
        });

        res.status(200).json({
            success: true,
            data: {
                vehicle,
                expenses,
                documents,
                checklists,
                todayChecklistCompleted: !!todayChecklist,
                todayChecklist
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
