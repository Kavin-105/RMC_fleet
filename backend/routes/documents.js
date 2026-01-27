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
const upload = require('../middleware/upload');

router.use(protect);

router.get('/expiring', authorize('owner'), getExpiringDocuments);

router
    .route('/')
    .get(getDocuments)
    .post(authorize('owner'), upload.single('document'), createDocument);

router
    .route('/:id')
    .get(getDocument)
    .put(authorize('owner'), updateDocument)
    .delete(authorize('owner'), deleteDocument);

module.exports = router;
