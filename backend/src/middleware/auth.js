const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    if (!req.user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
