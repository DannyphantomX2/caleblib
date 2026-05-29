const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  academicLevel: {
    type: Number,
    required: [true, 'Academic level is required'],
    enum: [100, 200, 300, 400]
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['first', 'second']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{3}\d{3}$/, 'Course code must follow format: CSC201']
  },
  courseTitle: {
    type: String,
    trim: true
  },
  resourceType: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: [
      'lecture_notes',
      'past_questions',
      'project_report',
      'code_example',
      'dataset',
      'tutorial',
      'technical_doc',
      'other'
    ]
  },
  // File information
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileFormat: {
    type: String,
    required: true
  },
  // Contributor
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributorRole: {
    type: String,
    enum: ['student', 'faculty', 'admin']
  },
  // Approval workflow
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Engagement metrics
  downloadCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  // Organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  academicYear: {
    type: String,
    trim: true
  },
  // For project reports specifically
  projectDomain: {
    type: String,
    enum: ['software_engineering', 'cybersecurity', 'data_science', 'information_systems', 'other', null],
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    fileId: mongoose.Schema.Types.ObjectId,
    fileName: String,
    uploadedAt: Date,
    version: Number
  }]
}, {
  timestamps: true
});

// Indexes for fast querying
resourceSchema.index({ academicLevel: 1, semester: 1, courseCode: 1 });
resourceSchema.index({ resourceType: 1 });
resourceSchema.index({ isApproved: 1, isArchived: 1 });
resourceSchema.index({ contributor: 1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ title: 'text', tags: 'text', courseCode: 'text', courseTitle: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
