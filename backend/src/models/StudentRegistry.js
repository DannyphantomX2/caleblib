const mongoose = require('mongoose');

// Admin pre-seeds this table before students can register
const studentRegistrySchema = new mongoose.Schema({
  matricNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  academicLevel: {
    type: Number,
    enum: [100, 200, 300, 400],
    required: true
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  registeredAt: Date,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentRegistry', studentRegistrySchema);
