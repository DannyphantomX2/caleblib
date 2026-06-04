const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Not authorized — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });
    if (user.isSuspended) return res.status(403).json({ error: `Account suspended: ${user.suspendedReason || 'Contact admin'}` });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized — invalid or expired token' });
  }
};

// Strict role guards
const studentOnly = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ error: 'Access denied — students only' });
  }
  next();
};

const staffOnly = (req, res, next) => {
  if (req.user?.role !== 'faculty') {
    return res.status(403).json({ error: 'Access denied — staff only' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied — admins only' });
  }
  next();
};

const staffOrAdmin = (req, res, next) => {
  if (!['faculty', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access denied — staff or admin only' });
  }
  next();
};

// Legacy support
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: `Access denied — requires: ${roles.join(', ')}` });
  }
  next();
};

module.exports = { protect, studentOnly, staffOnly, adminOnly, staffOrAdmin, authorize };
