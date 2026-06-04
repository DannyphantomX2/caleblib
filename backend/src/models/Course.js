const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{3}\d{3}$/, 'Format: CSC201']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  academicLevel: {
    type: Number,
    enum: [100, 200, 300, 400],
    required: true
  },
  semester: {
    type: String,
    enum: ['first', 'second'],
    required: true
  },
  units: {
    type: Number,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
