const express = require('express');
const notificationController = require('../../controllers/common/notification.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
router.get('/', authMiddleware, notificationController.getNotifications);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
