const express = require('express');
const router = express.Router();
const User = require('../models/User');

// One-time seed route — remove after use
router.post('/make-admin', async (req, res) => {
  try {
    const { email, secret } = req.body;
    if (secret !== 'caleb-seed-2026') {
      return res.status(403).json({ error: 'Invalid secret' });
    }
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
