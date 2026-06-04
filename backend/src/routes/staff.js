const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, staffOnly } = require('../middleware/auth');
const {
  getDashboard, getMyUploads, uploadResource, deleteMyResource,
  getRequests, createAnnouncement, getMyAnalytics
} = require('../controllers/staffController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(protect, staffOnly);

router.get('/dashboard', getDashboard);
router.get('/uploads', getMyUploads);
router.post('/upload', upload.single('file'), uploadResource);
router.delete('/uploads/:id', deleteMyResource);
router.get('/requests', getRequests);
router.post('/announcements', createAnnouncement);
router.get('/analytics', getMyAnalytics);

module.exports = router;

// Staff can view announcements they created + all active ones
const Announcement = require('../models/Announcement');
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'fullName')
      .sort({ isPinned: -1, createdAt: -1 });
    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
