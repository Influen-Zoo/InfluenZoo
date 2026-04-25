const Notification = require('../../models/Notification');

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { $set: { read: true } },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications for user as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
