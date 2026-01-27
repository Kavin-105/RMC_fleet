const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// @desc    Get all drivers
// @route   GET /api/drivers
exports.getDrivers = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { owner: req.user.id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(query)
            .populate('assignedVehicles', 'vehicleNumber model')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
exports.getDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('assignedVehicles', 'vehicleNumber model status');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create driver
// @route   POST /api/drivers
exports.createDriver = async (req, res) => {
    try {
        req.body.owner = req.user.id;

        // Create user account for driver
        const user = await User.create({
            name: req.body.name,
            mobile: req.body.mobile,
            password: req.body.password || 'driver123', // Default password
            role: 'driver'
        });

        req.body.user = user._id;

        const driver = await Driver.create(req.body);

        res.status(201).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
exports.updateDriver = async (req, res) => {
    try {
        let driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this driver'
            });
        }

        driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('assignedVehicles', 'vehicleNumber model');

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this driver'
            });
        }

        // Remove driver reference from all assigned vehicles
        await Vehicle.updateMany(
            { assignedDriver: driver._id },
            { $set: { assignedDriver: null } }
        );

        // Delete associated user account
        if (driver.user) {
            await User.findByIdAndDelete(driver.user);
        }

        await driver.deleteOne();

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

// @desc    Assign vehicle to driver
// @route   PUT /api/drivers/:id/assign-vehicle
exports.assignVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.body;

        let driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // If vehicle was assigned to another driver, remove it from their list
        if (vehicle.assignedDriver && vehicle.assignedDriver.toString() !== driver._id.toString()) {
            await Driver.findByIdAndUpdate(
                vehicle.assignedDriver,
                { $pull: { assignedVehicles: vehicleId } }
            );
        }

        // Update vehicle to be assigned to this driver
        vehicle.assignedDriver = driver._id;
        await vehicle.save();

        // Add vehicle to driver's assignedVehicles (if not already there)
        if (!driver.assignedVehicles.includes(vehicleId)) {
            driver.assignedVehicles.push(vehicleId);
            await driver.save();
        }

        driver = await Driver.findById(req.params.id)
            .populate('assignedVehicles', 'vehicleNumber model');

        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
