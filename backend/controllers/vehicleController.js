const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');
const Document = require('../models/Document');
const Checklist = require('../models/Checklist');
const Notification = require('../models/Notification');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

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

// @desc    Predict engine health for a vehicle
// @route   POST /api/vehicles/:id/engine-health
exports.predictEngineHealth = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        const { rpm, oil_pressure, fuel_pressure, coolant_pressure, oil_temp, coolant_temp } = req.body;
        const userId = req.user._id;

        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
            rpm, oil_pressure, fuel_pressure, coolant_pressure, oil_temp, coolant_temp
        }, { timeout: 15000 });

        // Save prediction result to vehicle using updateOne for reliability
        const predictionData = {
            status: response.data.status,
            confidence: response.data.confidence,
            issues: response.data.issues || [],
            parameters: response.data.parameters || { rpm, oil_pressure, fuel_pressure, coolant_pressure, oil_temp, coolant_temp },
            predictedAt: new Date(),
            predictedBy: userId
        };

        await Vehicle.updateOne(
            { _id: vehicle._id },
            { $set: { lastPrediction: predictionData } }
        );

        // Send notification to vehicle owner about driver prediction
        try {
            const statusEmoji = response.data.status === 'HEALTHY' ? '✅' : '⚠️';
            const issueCount = (response.data.issues || []).length;
            await Notification.create({
                recipient: vehicle.owner,
                type: 'general',
                title: `${statusEmoji} Engine Prediction: ${vehicle.vehicleNumber} - ${response.data.status}`,
                message: `Driver ran engine health prediction for ${vehicle.vehicleNumber}. Result: ${response.data.status} (${response.data.confidence}% confidence)${issueCount > 0 ? `. ${issueCount} issue${issueCount > 1 ? 's' : ''} detected.` : '. No issues detected.'}`,
                relatedVehicle: vehicle._id,
                severity: response.data.status === 'HEALTHY' ? 'success' : 'warning'
            });
        } catch (notifErr) {
            console.error('Failed to create prediction notification:', notifErr.message);
        }

        res.status(200).json({
            success: true,
            data: {
                vehicleNumber: vehicle.vehicleNumber,
                ...response.data
            }
        });
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ success: false, message: 'ML service is not available' });
        }
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            return res.status(504).json({ success: false, message: 'ML service timed out. Please try again.' });
        }
        console.error('Prediction error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get vehicle health score (automated - based on expenses, checklists, age)
// @route   GET /api/vehicles/:id/health-score
exports.getVehicleHealthScore = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('assignedDriver', 'name');
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Get maintenance expenses (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const maintenanceExpenses = await Expense.find({
            vehicle: req.params.id,
            type: { $in: ['Maintenance', 'Spare Parts'] },
            status: 'Approved',
            createdAt: { $gte: sixMonthsAgo }
        });

        const totalMaintenanceCost = maintenanceExpenses.reduce((sum, e) => sum + e.amount, 0);
        const maintenanceCount = maintenanceExpenses.length;

        // Get checklist compliance (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const checklists = await Checklist.find({
            vehicle: req.params.id,
            date: { $gte: thirtyDaysAgo }
        });

        const checklistDays = checklists.length;
        const allCheckedDays = checklists.filter(c => c.allChecked).length;
        const checklistCompliance = checklistDays > 0 ? Math.round((allCheckedDays / checklistDays) * 100) : 0;

        // Get document status
        const documents = await Document.find({ vehicle: req.params.id });
        const now = new Date();
        const expiredDocs = documents.filter(d => new Date(d.expiryDate) < now).length;
        const totalDocs = documents.length;

        // Calculate vehicle age
        const vehicleAge = new Date().getFullYear() - vehicle.manufacturingYear;

        // Calculate health score (0-100) using weighted scoring
        // Weights: maintenance cost 20%, maintenance frequency 15%, checklist compliance 25%, documents 20%, age 10%, odometer 10%
        let maintenanceCostScore = 100;
        if (totalMaintenanceCost > 50000) maintenanceCostScore = 20;
        else if (totalMaintenanceCost > 25000) maintenanceCostScore = 50;
        else if (totalMaintenanceCost > 10000) maintenanceCostScore = 75;
        else if (totalMaintenanceCost > 5000) maintenanceCostScore = 85;

        let maintenanceFreqScore = 100;
        if (maintenanceCount > 5) maintenanceFreqScore = 25;
        else if (maintenanceCount > 3) maintenanceFreqScore = 50;
        else if (maintenanceCount > 1) maintenanceFreqScore = 75;

        let checklistScore = checklistCompliance; // already 0-100

        let documentScore = 100;
        if (totalDocs > 0) {
            const validDocs = totalDocs - expiredDocs;
            documentScore = Math.round((validDocs / totalDocs) * 100);
        }

        let ageScore = 100;
        if (vehicleAge > 10) ageScore = 30;
        else if (vehicleAge > 7) ageScore = 50;
        else if (vehicleAge > 5) ageScore = 70;
        else if (vehicleAge > 3) ageScore = 85;

        let odometerScore = 100;
        if (vehicle.currentOdometer > 200000) odometerScore = 30;
        else if (vehicle.currentOdometer > 150000) odometerScore = 50;
        else if (vehicle.currentOdometer > 100000) odometerScore = 70;
        else if (vehicle.currentOdometer > 50000) odometerScore = 85;

        let healthScore = Math.round(
            maintenanceCostScore * 0.20 +
            maintenanceFreqScore * 0.15 +
            checklistScore * 0.25 +
            documentScore * 0.20 +
            ageScore * 0.10 +
            odometerScore * 0.10
        );

        healthScore = Math.max(0, Math.min(100, healthScore));

        let status = 'Excellent';
        if (healthScore < 40) status = 'Critical';
        else if (healthScore < 60) status = 'Poor';
        else if (healthScore < 75) status = 'Fair';
        else if (healthScore < 90) status = 'Good';

        // Recommendations
        const recommendations = [];
        if (totalMaintenanceCost > 25000) recommendations.push('High maintenance costs detected. Consider a thorough inspection.');
        if (maintenanceCount > 3) recommendations.push('Frequent repairs indicate potential underlying issues.');
        if (checklistCompliance < 75) recommendations.push('Low checklist compliance. Ensure daily inspections are completed.');
        if (expiredDocs > 0) recommendations.push(`${expiredDocs} expired document(s). Renew immediately.`);
        if (vehicleAge > 7) recommendations.push('Vehicle is aging. Plan for replacement or major overhaul.');
        if (vehicle.currentOdometer > 150000) recommendations.push('High mileage. Schedule comprehensive maintenance.');
        if (recommendations.length === 0) recommendations.push('Vehicle is in good condition. Continue regular maintenance.');

        res.status(200).json({
            success: true,
            data: {
                vehicleNumber: vehicle.vehicleNumber,
                model: vehicle.model,
                healthScore,
                status,
                metrics: {
                    maintenanceCost6Months: totalMaintenanceCost,
                    maintenanceCount6Months: maintenanceCount,
                    checklistCompliance,
                    expiredDocuments: expiredDocs,
                    totalDocuments: totalDocs,
                    vehicleAge,
                    currentOdometer: vehicle.currentOdometer,
                    engineHours: vehicle.engineHours
                },
                recommendations
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get fleet analytics summary
// @route   GET /api/vehicles/analytics/summary
exports.getFleetAnalytics = async (req, res) => {
    try {
        const { vehicleId } = req.query;
        const Driver = require('../models/Driver');
        
        let query = { owner: req.user.id };
        if (vehicleId) {
            query._id = vehicleId;
        }

        const vehicles = await Vehicle.find(query)
            .populate('assignedDriver', 'name');

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const vehicleIds = vehicles.map(v => v._id);

        // Get ALL expenses (not just approved) for richer analytics
        const allExpenses = await Expense.find({
            vehicle: { $in: vehicleIds },
            createdAt: { $gte: sixMonthsAgo }
        });
        const approvedExpenses = allExpenses.filter(e => e.status === 'Approved');
        const pendingExpenses = allExpenses.filter(e => e.status === 'Pending');

        // Expense breakdown by type (approved only)
        const expenseByType = {};
        approvedExpenses.forEach(e => {
            expenseByType[e.type] = (expenseByType[e.type] || 0) + e.amount;
        });

        // Monthly expense trend
        const monthlyExpenses = {};
        approvedExpenses.forEach(e => {
            const month = new Date(e.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyExpenses[month] = (monthlyExpenses[month] || 0) + e.amount;
        });

        // Vehicle-wise costs
        const vehicleCostsMap = {};
        approvedExpenses.forEach(e => {
            const vId = e.vehicle.toString();
            vehicleCostsMap[vId] = (vehicleCostsMap[vId] || 0) + e.amount;
        });

        const vehicleCosts = vehicles.map(v => ({
            vehicleNumber: v.vehicleNumber,
            model: v.model,
            totalCost: vehicleCostsMap[v._id.toString()] || 0,
            status: v.status
        })).sort((a, b) => b.totalCost - a.totalCost);

        const totalExpense = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

        // --- DOCUMENT ANALYTICS ---
        const documents = await Document.find({ vehicle: { $in: vehicleIds } });
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiredDocs = documents.filter(d => new Date(d.expiryDate) < now);
        const expiringSoonDocs = documents.filter(d => {
            const exp = new Date(d.expiryDate);
            return exp >= now && exp <= thirtyDaysFromNow;
        });
        const validDocs = documents.filter(d => new Date(d.expiryDate) > thirtyDaysFromNow);

        // Document type breakdown
        const docsByType = {};
        documents.forEach(d => {
            docsByType[d.type] = (docsByType[d.type] || 0) + 1;
        });

        // --- CHECKLIST ANALYTICS ---
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const checklists = await Checklist.find({
            vehicle: { $in: vehicleIds },
            date: { $gte: thirtyDaysAgo }
        });

        // Today's checklist completion
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayChecklists = checklists.filter(c => {
            const d = new Date(c.date);
            return d >= today && d < tomorrow;
        });

        const assignedVehicleCount = vehicles.filter(v => v.assignedDriver).length;
        const checklistComplianceToday = assignedVehicleCount > 0
            ? Math.round((todayChecklists.length / assignedVehicleCount) * 100) : 0;

        // Checklist issues reported (last 30 days) - items is an object with boolean fields
        let issuesReported = 0;
        checklists.forEach(c => {
            if (c.items) {
                const itemValues = Object.values(c.items.toObject ? c.items.toObject() : c.items);
                itemValues.forEach(val => {
                    if (val === false) issuesReported++;
                });
            }
        });

        // --- FLEET HEALTH SUMMARY ---
        const healthSummary = {
            healthy: 0,
            atRisk: 0,
            noPrediction: 0
        };
        vehicles.forEach(v => {
            if (!v.lastPrediction?.status) healthSummary.noPrediction++;
            else if (v.lastPrediction.status === 'HEALTHY') healthSummary.healthy++;
            else healthSummary.atRisk++;
        });

        // --- DRIVER STATS ---
        const drivers = await Driver.find({ owner: req.user.id });
        const activeDrivers = drivers.filter(d => d.status === 'Active').length;
        const driversWithVehicles = vehicles.filter(v => v.assignedDriver).length;

        res.status(200).json({
            success: true,
            data: {
                // Fleet overview
                totalVehicles: vehicles.length,
                activeVehicles: vehicles.filter(v => v.status === 'Active').length,
                maintenanceVehicles: vehicles.filter(v => v.status === 'Maintenance').length,
                inactiveVehicles: vehicles.filter(v => v.status === 'Inactive').length,
                // Expense data
                totalExpense,
                pendingExpenseCount: pendingExpenses.length,
                pendingExpenseTotal: pendingExpenses.reduce((s, e) => s + e.amount, 0),
                expenseByType,
                monthlyExpenses,
                vehicleCosts,
                // Document data
                totalDocuments: documents.length,
                expiredDocuments: expiredDocs.length,
                expiringSoonDocuments: expiringSoonDocs.length,
                validDocuments: validDocs.length,
                docsByType,
                // Checklist data
                checklistComplianceToday,
                todayChecklistsDone: todayChecklists.length,
                totalChecklistsLast30: checklists.length,
                issuesReported,
                // Fleet health (ML predictions)
                healthSummary,
                // Drivers
                totalDrivers: drivers.length,
                activeDrivers,
                driversWithVehicles,
                unassignedVehicles: vehicles.length - driversWithVehicles
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get last ML prediction for a vehicle
// @route   GET /api/vehicles/:id/last-prediction
exports.getLastPrediction = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('lastPrediction.predictedBy', 'name');
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Only return prediction if it has actual data (status field exists)
        const pred = vehicle.lastPrediction?.status ? vehicle.lastPrediction : null;

        res.status(200).json({
            success: true,
            data: pred
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


