const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    getVehicleDetails,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    assignDriver,
    predictEngineHealth,
    getVehicleHealthScore,
    getFleetAnalytics,
    getLastPrediction
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Fleet analytics (must be before /:id routes)
router.get('/analytics/summary', authorize('owner'), getFleetAnalytics);

router
    .route('/')
    .get(getVehicles)
    .post(authorize('owner'), createVehicle);

router.get('/:id/details', getVehicleDetails);
router.post('/:id/engine-health', predictEngineHealth);
router.get('/:id/health-score', getVehicleHealthScore);
router.get('/:id/last-prediction', getLastPrediction);

router
    .route('/:id')
    .get(getVehicle)
    .put(authorize('owner'), updateVehicle)
    .delete(authorize('owner'), deleteVehicle);

router.put('/:id/assign-driver', authorize('owner'), assignDriver);

module.exports = router;
