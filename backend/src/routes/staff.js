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


// Update request status
const ResourceRequest = require('../models/ResourceRequest');
router.put('/requests/:id', protect, staffOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const request = await ResourceRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { returnDocument: 'after' }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });
    return res.json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// Edit own resource
router.put('/uploads/:id', protect, staffOnly, async (req, res) => {
  try {
    const Resource = require('../models/Resource');
    const { title, description, courseCode, courseTitle, tags, academicYear } = req.body;
    const resource = await Resource.findOne({ _id: req.params.id, contributor: req.user._id });
    if (!resource) return res.status(404).json({ error: 'Resource not found or not yours' });
    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (courseCode) resource.courseCode = courseCode;
    if (courseTitle !== undefined) resource.courseTitle = courseTitle;
    if (tags) resource.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (academicYear) resource.academicYear = academicYear;
    await resource.save();
    return res.json({ success: true, resource });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
