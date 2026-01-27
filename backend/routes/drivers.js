const express = require('express');
const router = express.Router();
const {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    deleteDriver,
    assignVehicle
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('owner'));

router
    .route('/')
    .get(getDrivers)
    .post(createDriver);

router.put('/:id/assign-vehicle', assignVehicle);

router
    .route('/:id')
    .get(getDriver)
    .put(updateDriver)
    .delete(deleteDriver);

module.exports = router;
