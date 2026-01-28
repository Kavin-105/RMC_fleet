const Expense = require('../models/Expense');
const Driver = require('../models/Driver');

// @desc    Get all expenses
// @route   GET /api/expenses
exports.getExpenses = async (req, res) => {
    try {
        const { vehicleId, driverId, status, type } = req.query;
        let query = {};

        // If user is owner, show all their expenses
        if (req.user.role === 'owner') {
            query.owner = req.user.id;
        } else {
            // If user is driver, show only their expenses
            const driver = await Driver.findOne({ user: req.user.id });
            if (driver) {
                query.driver = driver._id;
            }
        }

        if (vehicleId) query.vehicle = vehicleId;
        if (driverId) query.driver = driverId;
        if (status) query.status = status;
        if (type) query.type = type;

        const expenses = await Expense.find(query)
            .populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get expense summary
// @route   GET /api/expenses/summary
exports.getExpenseSummary = async (req, res) => {
    try {
        let matchQuery = {};

        if (req.user.role === 'owner') {
            matchQuery.owner = req.user._id;
        } else {
            const driver = await Driver.findOne({ user: req.user.id });
            if (driver) {
                matchQuery.driver = driver._id;
            }
        }

        const total = await Expense.aggregate([
            { $match: { ...matchQuery, status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const pending = await Expense.aggregate([
            { $match: { ...matchQuery, status: 'Pending' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const byType = await Expense.aggregate([
            { $match: { ...matchQuery, status: 'Approved' } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalApproved: total[0]?.total || 0,
                pendingAmount: pending[0]?.total || 0,
                pendingCount: pending[0]?.count || 0,
                byType: byType.reduce((acc, item) => {
                    acc[item._id] = item.total;
                    return acc;
                }, {})
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
exports.getExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('vehicle', 'vehicleNumber model')
            .populate('driver', 'name mobile');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create expense (driver)
// @route   POST /api/expenses
exports.createExpense = async (req, res) => {
    try {
        // Determine the owner based on who is creating the expense
        let ownerId = req.user.id;

        if (req.user.role === 'driver') {
            // If driver is creating, look up the owner from the driver record
            const driver = await Driver.findOne({ user: req.user.id });
            if (driver && driver.owner) {
                ownerId = driver.owner;
                // Also set the driver ID if not provided
                if (!req.body.driver) {
                    req.body.driver = driver._id;
                }
                // Check if driver has an assigned vehicle
                if (!driver.assignedVehicles || driver.assignedVehicles.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'You do not have an assigned vehicle. Please contact your fleet manager to assign a vehicle before submitting expenses.',
                        noVehicle: true
                    });
                }
                // Set the vehicle from driver's assigned vehicles if not provided
                if (!req.body.vehicle) {
                    req.body.vehicle = driver.assignedVehicles[0];
                }
            }
        }

        req.body.owner = ownerId;
        req.body.status = 'Pending'; // Always start as pending

        // Handle file upload if present
        if (req.file) {
            req.body.billPhoto = req.file.buffer.toString('base64');
            req.body.billPhotoContentType = req.file.mimetype;
            req.body.billPhotoName = req.file.originalname;
        }

        const expense = await Expense.create(req.body);

        const populatedExpense = await Expense.findById(expense._id)
            .populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name');

        res.status(201).json({
            success: true,
            data: populatedExpense
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name');

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Approve expense
// @route   PUT /api/expenses/:id/approve
exports.approveExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        expense.status = 'Approved';
        expense.approvedBy = req.user.id;
        expense.approvedAt = new Date();
        await expense.save();

        expense = await Expense.findById(req.params.id)
            .populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name');

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Reject expense
// @route   PUT /api/expenses/:id/reject
exports.rejectExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        expense.status = 'Rejected';
        expense.rejectionReason = req.body.reason || null;
        await expense.save();

        expense = await Expense.findById(req.params.id)
            .populate('vehicle', 'vehicleNumber')
            .populate('driver', 'name');

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        await expense.deleteOne();

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

// @desc    Get expense bill photo
// @route   GET /api/expenses/:id/bill
exports.getBillPhoto = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (!expense.billPhoto) {
            return res.status(404).json({
                success: false,
                message: 'No bill photo attached to this expense'
            });
        }

        // Convert Base64 back to buffer
        const fileBuffer = Buffer.from(expense.billPhoto, 'base64');

        // Set appropriate headers
        res.set({
            'Content-Type': expense.billPhotoContentType || 'image/jpeg',
            'Content-Disposition': `inline; filename="${expense.billPhotoName || 'bill.jpg'}"`,
            'Content-Length': fileBuffer.length
        });

        res.send(fileBuffer);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
