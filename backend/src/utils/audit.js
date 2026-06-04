const AuditLog = require('../models/AuditLog');

const log = async ({ userId, userEmail, userRole, action, description, resourceId, req, status = 'SUCCESS' }) => {
  try {
    await AuditLog.create({
      userId,
      userEmail,
      userRole,
      action,
      description,
      resourceId,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown',
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      status
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { log };
