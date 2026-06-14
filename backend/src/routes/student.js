const express = require('express');
const router = express.Router();
const { protect, studentOnly } = require('../middleware/auth');
const {
  getDashboard, getResources, getResource, downloadResource,
  toggleBookmark, getBookmarks, createRequest, getMyRequests
} = require('../controllers/studentController');

router.use(protect, studentOnly);

router.get('/dashboard', getDashboard);
router.get('/resources', getResources);
router.get('/resources/:id', getResource);
router.get('/resources/:id/download', downloadResource);
router.post('/bookmarks/:id', toggleBookmark);
router.get('/bookmarks', getBookmarks);
router.post('/requests', createRequest);
router.get('/requests', getMyRequests);

module.exports = router;


// Submit review
const Review = require('../models/Review');
router.post('/resources/:id/review', protect, studentOnly, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ error: 'Rating is required' });
    const existing = await Review.findOne({ resource: req.params.id, reviewer: req.user._id });
    if (existing) return res.status(400).json({ error: 'You have already reviewed this resource' });
    const review = await Review.create({
      resource: req.params.id,
      reviewer: req.user._id,
      rating: parseInt(rating),
      comment
    });
    return res.status(201).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get announcements for students
const Announcement = require('../models/Announcement');
router.get('/announcements', protect, studentOnly, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ targetRole: 'student' }, { targetRole: 'all' }]
    })
      .populate('createdBy', 'fullName')
      .sort({ isPinned: -1, createdAt: -1 });
    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// Download history from audit log
const AuditLog = require('../models/AuditLog');
router.get('/downloads/history', protect, studentOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find({
        userId: req.user._id,
        action: 'DOWNLOAD_RESOURCE'
      })
        .populate('resourceId', 'title courseCode fileFormat fileSize resourceType academicLevel')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments({
        userId: req.user._id,
        action: 'DOWNLOAD_RESOURCE'
      })
    ]);

    return res.json({ success: true, total, pages: Math.ceil(total / parseInt(limit)), logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get reviews for a resource
router.get('/resources/:id/reviews', protect, studentOnly, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const reviews = await Review.find({ resource: req.params.id })
      .populate('reviewer', 'fullName')
      .sort({ createdAt: -1 })
      .limit(20);
    const myReview = await Review.findOne({ resource: req.params.id, reviewer: req.user._id });
    return res.json({ success: true, reviews, myReview });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
