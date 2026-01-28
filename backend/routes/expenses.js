const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getExpenseSummary,
    getBillPhoto
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/summary', authorize('owner'), getExpenseSummary);

router
    .route('/')
    .get(getExpenses)
    .post(upload.single('billPhoto'), createExpense);

// Bill photo endpoint
router.get('/:id/bill', getBillPhoto);

router
    .route('/:id')
    .get(getExpense)
    .put(updateExpense)
    .delete(deleteExpense);

router.put('/:id/approve', authorize('owner'), approveExpense);
router.put('/:id/reject', authorize('owner'), rejectExpense);

module.exports = router;
