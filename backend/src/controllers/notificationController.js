const Notification = require('../models/Notification');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('resource', 'title courseCode');

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { returnDocument: 'after' }
    );

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
