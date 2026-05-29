const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['upload', 'download', 'search', 'view', 'review']
  },
  userRole: {
    type: String,
    enum: ['student', 'faculty', 'admin']
  },
  academicLevel: {
    type: Number,
    enum: [100, 200, 300, 400]
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  courseCode: {
    type: String
  },
  resourceType: {
    type: String
  },
  searchQuery: {
    type: String
  },
  resultCount: {
    type: Number
  },
  sessionId: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-expire logs after 90 days
analyticsLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
analyticsLogSchema.index({ eventType: 1, createdAt: -1 });
analyticsLogSchema.index({ resource: 1, eventType: 1 });

module.exports = mongoose.model('AnalyticsLog', analyticsLogSchema);
