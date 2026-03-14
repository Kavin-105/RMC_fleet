const express = require('express');
const router = express.Router();
const {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    deleteDriver,
    assignVehicle,
    extractLicense
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('owner'));

// License OCR extraction route (must be before /:id routes)
router.post('/extract-license', upload.single('licenseFile'), extractLicense);

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
