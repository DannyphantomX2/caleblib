const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['new_resource', 'resource_approved', 'resource_rejected', 'new_review', 'system']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-expire after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
