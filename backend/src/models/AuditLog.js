const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  userRole: String,
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'REGISTER',
      'UPLOAD_RESOURCE', 'DELETE_RESOURCE', 'APPROVE_RESOURCE',
      'REJECT_RESOURCE', 'DOWNLOAD_RESOURCE',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'SUSPEND_USER',
      'CREATE_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT',
      'SEED_STUDENT', 'ACCOUNT_LOCKED', 'PASSWORD_CHANGED',
      'VIEW_AUDIT_LOG'
    ]
  },
  description: String,
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  }
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
