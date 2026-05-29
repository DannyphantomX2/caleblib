const Resource = require('../models/Resource');
const User = require('../models/User');
const AnalyticsLog = require('../models/AnalyticsLog');

// @desc    Get dashboard overview stats
// @route   GET /api/analytics/overview
// @access  Private (admin, faculty)
const getOverview = async (req, res) => {
  try {
    const [
      totalResources,
      pendingResources,
      totalUsers,
      totalStudents,
      totalFaculty,
      totalDownloads
    ] = await Promise.all([
      Resource.countDocuments({ isApproved: true, isArchived: false }),
      Resource.countDocuments({ isApproved: false, isArchived: false }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      Resource.aggregate([
        { $group: { _id: null, total: { $sum: '$downloadCount' } } }
      ])
    ]);

    return res.json({
      success: true,
      stats: {
        totalResources,
        pendingResources,
        totalUsers,
        totalStudents,
        totalFaculty,
        totalDownloads: totalDownloads[0]?.total || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get resource distribution by level and type
// @route   GET /api/analytics/resources
// @access  Private (admin, faculty)
const getResourceStats = async (req, res) => {
  try {
    const [byLevel, byType, byCourse, mostDownloaded] = await Promise.all([
      // Resources per academic level
      Resource.aggregate([
        { $match: { isApproved: true, isArchived: false } },
        { $group: { _id: '$academicLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // Resources per type
      Resource.aggregate([
        { $match: { isApproved: true, isArchived: false } },
        { $group: { _id: '$resourceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Resources per course code
      Resource.aggregate([
        { $match: { isApproved: true, isArchived: false } },
        { $group: { _id: '$courseCode', count: { $sum: 1 }, courseTitle: { $first: '$courseTitle' } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),

      // Most downloaded resources
      Resource.find({ isApproved: true, isArchived: false })
        .sort({ downloadCount: -1 })
        .limit(10)
        .select('title courseCode resourceType downloadCount averageRating')
    ]);

    return res.json({ success: true, byLevel, byType, byCourse, mostDownloaded });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get resource coverage gaps
// @route   GET /api/analytics/gaps
// @access  Private (admin, faculty)
const getCoverageGaps = async (req, res) => {
  try {
    // Thresholds from methodology chapter
    const THRESHOLDS = {
      lecture_notes: 3,
      past_questions: 2,
      project_report: 1,
      code_example: 1
    };

    // Get all courses that have any resource
    const courseCoverage = await Resource.aggregate([
      { $match: { isApproved: true, isArchived: false } },
      {
        $group: {
          _id: { courseCode: '$courseCode', resourceType: '$resourceType', academicLevel: '$academicLevel' },
          count: { $sum: 1 },
          courseTitle: { $first: '$courseTitle' }
        }
      },
      { $sort: { '_id.academicLevel': 1, '_id.courseCode': 1 } }
    ]);

    // Find gaps — courses below threshold
    const gaps = [];
    const courseMap = {};

    courseCoverage.forEach(item => {
      const key = `${item._id.courseCode}-${item._id.academicLevel}`;
      if (!courseMap[key]) {
        courseMap[key] = {
          courseCode: item._id.courseCode,
          academicLevel: item._id.academicLevel,
          courseTitle: item.courseTitle,
          resources: {}
        };
      }
      courseMap[key].resources[item._id.resourceType] = item.count;
    });

    Object.values(courseMap).forEach(course => {
      const courseGaps = [];
      Object.entries(THRESHOLDS).forEach(([type, threshold]) => {
        const count = course.resources[type] || 0;
        if (count < threshold) {
          courseGaps.push({ type, current: count, required: threshold, deficit: threshold - count });
        }
      });
      if (courseGaps.length > 0) {
        gaps.push({ ...course, gaps: courseGaps });
      }
    });

    return res.json({ success: true, total: gaps.length, gaps });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get recent activity feed
// @route   GET /api/analytics/activity
// @access  Private (admin, faculty)
const getActivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [uploadTrend, downloadTrend, searchTrend, recentUploads] = await Promise.all([
      AnalyticsLog.aggregate([
        { $match: { eventType: 'upload', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      AnalyticsLog.aggregate([
        { $match: { eventType: 'download', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      AnalyticsLog.aggregate([
        { $match: { eventType: 'search', createdAt: { $gte: since } } },
        { $group: { _id: '$searchQuery', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Resource.find({ isApproved: true, isArchived: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('contributor', 'fullName role')
        .select('title courseCode resourceType createdAt contributor')
    ]);

    return res.json({ success: true, uploadTrend, downloadTrend, topSearches: searchTrend, recentUploads });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get adoption rate stats
// @route   GET /api/analytics/adoption
// @access  Private (admin)
const getAdoption = async (req, res) => {
  try {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [totalStudents, totalFaculty, activeUsers, registrationTrend] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      User.countDocuments({ lastLogin: { $gte: twoWeeksAgo }, isActive: true }),
      User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            role: { $first: '$role' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ])
    ]);

    const adoptionRate = totalStudents + totalFaculty > 0
      ? Math.round((activeUsers / (totalStudents + totalFaculty)) * 100)
      : 0;

    return res.json({
      success: true,
      totalStudents,
      totalFaculty,
      activeUsers,
      adoptionRate,
      registrationTrend
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getOverview, getResourceStats, getCoverageGaps, getActivity, getAdoption };
