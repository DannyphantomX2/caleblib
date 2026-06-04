const User = require('../models/User');
const StudentRegistry = require('../models/StudentRegistry');
const generateToken = require('../utils/generateToken');
const { log } = require('../utils/audit');

const MAX_FAILED = 5;
const LOCK_DURATION = 15 * 60 * 1000;

// POST /api/auth/register/student
const registerStudent = async (req, res) => {
  try {
    const { fullName, email, password, matricNumber, academicLevel } = req.body;

    if (!fullName || !email || !password || !matricNumber || !academicLevel) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Only verify matric number exists in registry (email will be provided by student)
    const registry = await StudentRegistry.findOne({
      matricNumber: matricNumber.trim().toUpperCase()
    });

    if (!registry) {
      return res.status(403).json({
        error: 'Your matric number was not found in the student registry. Contact your administrator.'
      });
    }

    if (registry.isRegistered) {
      return res.status(400).json({
        error: 'An account for this matric number already exists. Contact admin if this is an error.'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password,
      role: 'student',
      matricNumber: matricNumber.trim().toUpperCase(),
      academicLevel: parseInt(academicLevel)
    });

    await StudentRegistry.findByIdAndUpdate(registry._id, {
      isRegistered: true,
      registeredAt: new Date()
    });

    await log({
      userId: user._id, userEmail: user.email, userRole: 'student',
      action: 'REGISTER', description: `Student registered: ${user.fullName} (${user.matricNumber})`,
      req, status: 'SUCCESS'
    });

    const token = generateToken(user._id);
    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role })
      .select('+password +failedLoginAttempts +lockedUntil');

    if (!user) {
      await log({
        userEmail: email, userRole: role, action: 'FAILED_LOGIN',
        description: `Failed login — ${email} not found as ${role}`,
        req, status: 'FAILURE'
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isLocked()) {
      const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({
        error: `Account locked. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        error: `Account suspended: ${user.suspendedReason || 'Contact administrator.'}`
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated. Contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION);
        await user.save();
        await log({
          userId: user._id, userEmail: user.email, userRole: user.role,
          action: 'ACCOUNT_LOCKED',
          description: `Locked after ${MAX_FAILED} failed attempts`,
          req, status: 'FAILURE'
        });
        return res.status(423).json({
          error: `Too many failed attempts. Account locked for 15 minutes.`
        });
      }

      await user.save();
      const remaining = MAX_FAILED - user.failedLoginAttempts;
      await log({
        userId: user._id, userEmail: user.email, userRole: user.role,
        action: 'FAILED_LOGIN',
        description: `Failed attempt ${user.failedLoginAttempts}/${MAX_FAILED}`,
        req, status: 'FAILURE'
      });
      return res.status(401).json({
        error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`
      });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date();
    user.lastSeen = new Date();
    await user.save();

    await log({
      userId: user._id, userEmail: user.email, userRole: user.role,
      action: 'LOGIN', description: 'Successful login', req
    });

    const token = generateToken(user._id);
    return res.json({ success: true, token, user });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
    return res.json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: req.user.role,
      action: 'LOGOUT', description: 'User logged out', req
    });
    return res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { registerStudent, login, getMe, logout };
