const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  // Student fields
  matricNumber: { type: String, trim: true, uppercase: true },
  academicLevel: { type: Number, enum: [100, 200, 300, 400] },
  // Faculty/Admin fields
  employeeId: { type: String, trim: true },
  department: { type: String, default: 'Computer Science' },
  // Status
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspendedReason: String,
  lastLogin: Date,
  lastSeen: Date,
  // Security — account lockout
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  // Theme preference
  theme: { type: String, enum: ['light', 'dark'], default: 'light' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.failedLoginAttempts;
  delete user.lockedUntil;
  return user;
};

module.exports = mongoose.model('User', userSchema);
