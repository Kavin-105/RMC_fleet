const express = require('express');
const router = express.Router();
const {
    getChecklists,
    getChecklist,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    getTodayChecklist
} = require('../controllers/checklistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayChecklist);

router
    .route('/')
    .get(getChecklists)
    .post(createChecklist);

router
    .route('/:id')
    .get(getChecklist)
    .put(updateChecklist)
    .delete(deleteChecklist);

module.exports = router;
