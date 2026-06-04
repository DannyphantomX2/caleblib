const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerStudent, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register/student', loginLimiter, registerStudent);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;

// Update own profile
router.put('/me', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const { fullName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName },
      { returnDocument: 'after', runValidators: true }
    );
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
