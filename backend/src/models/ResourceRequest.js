const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  courseCode: String,
  academicLevel: Number,
  resourceType: {
    type: String,
    enum: ['lecture_notes', 'past_questions', 'project_report', 'code_example', 'dataset', 'tutorial', 'technical_doc', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'fulfilled', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  adminNote: String
}, { timestamps: true });

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
