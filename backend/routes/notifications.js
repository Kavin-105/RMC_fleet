const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    triggerExpiryCheck
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.delete('/clear-read', clearReadNotifications);
router.post('/check-expiry', authorize('owner'), triggerExpiryCheck);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
