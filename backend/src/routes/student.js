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