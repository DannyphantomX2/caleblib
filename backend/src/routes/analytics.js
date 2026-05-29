const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOverview,
  getResourceStats,
  getCoverageGaps,
  getActivity,
  getAdoption
} = require('../controllers/analyticsController');

router.get('/overview', protect, authorize('admin', 'faculty'), getOverview);
router.get('/resources', protect, authorize('admin', 'faculty'), getResourceStats);
router.get('/gaps', protect, authorize('admin', 'faculty'), getCoverageGaps);
router.get('/activity', protect, authorize('admin', 'faculty'), getActivity);
router.get('/adoption', protect, authorize('admin'), getAdoption);

module.exports = router;
