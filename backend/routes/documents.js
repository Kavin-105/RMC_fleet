const express = require('express');
const router = express.Router();
const {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    getExpiringDocuments,
    getDocumentFile
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/expiring', authorize('owner'), getExpiringDocuments);

router
    .route('/')
    .get(getDocuments)
    .post(authorize('owner'), upload.single('document'), createDocument);

// Must be before /:id route to avoid conflict
router.get('/:id/file', getDocumentFile);

router
    .route('/:id')
    .get(getDocument)
    .put(authorize('owner'), updateDocument)
    .delete(authorize('owner'), deleteDocument);

module.exports = router;
