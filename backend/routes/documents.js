const express = require('express');
const router = express.Router();
const {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    getExpiringDocuments
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/expiring', authorize('owner'), getExpiringDocuments);

router
    .route('/')
    .get(getDocuments)
    .post(authorize('owner'), createDocument);

router
    .route('/:id')
    .get(getDocument)
    .put(authorize('owner'), updateDocument)
    .delete(authorize('owner'), deleteDocument);

module.exports = router;
