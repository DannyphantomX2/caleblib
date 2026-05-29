const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  uploadResource,
  getResources,
  getResource,
  downloadResource,
  approveResource,
  addReview,
  getPendingResources
} = require('../controllers/resourceController');

// Multer config - store in memory, GridFS handles persistence
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/pending', protect, authorize('faculty', 'admin'), getPendingResources);
router.get('/', protect, getResources);
router.get('/:id', protect, getResource);
router.get('/:id/download', protect, downloadResource);
router.post('/', protect, upload.single('file'), uploadResource);
router.put('/:id/approve', protect, authorize('faculty', 'admin'), approveResource);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
