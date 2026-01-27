const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    getVehicleDetails,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    assignDriver
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getVehicles)
    .post(authorize('owner'), createVehicle);

router.get('/:id/details', getVehicleDetails);

router
    .route('/:id')
    .get(getVehicle)
    .put(authorize('owner'), updateVehicle)
    .delete(authorize('owner'), deleteVehicle);

router.put('/:id/assign-driver', authorize('owner'), assignDriver);

module.exports = router;
