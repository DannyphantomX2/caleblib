const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const ResourceRequest = require('../models/ResourceRequest');
const Announcement = require('../models/Announcement');
const AnalyticsLog = require('../models/AnalyticsLog');
const { log } = require('../utils/audit');
const gridfsService = require('../services/gridfsService');

// Dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalResources, recentResources, announcements, bookmarkCount] = await Promise.all([
      Resource.countDocuments({ isApproved: true, isArchived: false }),
      Resource.find({ isApproved: true, isArchived: false })
        .sort({ createdAt: -1 }).limit(8)
        .populate('contributor', 'fullName role'),
      Announcement.find({
        isActive: true,
        $or: [{ targetRole: 'student' }, { targetRole: 'all' }]
      }).sort({ isPinned: -1, createdAt: -1 }).limit(5),
      Bookmark.countDocuments({ student: req.user._id })
    ]);
    return res.json({ success: true, stats: { totalResources, bookmarkCount }, recentResources, announcements });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Browse resources
const getResources = async (req, res) => {
  try {
    const { academicLevel, semester, courseCode, resourceType, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
    const filter = { isApproved: true, isArchived: false };
    if (academicLevel) filter.academicLevel = parseInt(academicLevel);
    if (semester) filter.semester = semester;
    if (courseCode) filter.courseCode = courseCode.toUpperCase();
    if (resourceType) filter.resourceType = resourceType;
    if (search) filter.$text = { $search: search };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };
    const [resources, total] = await Promise.all([
      Resource.find(filter).populate('contributor', 'fullName role').sort(sortOptions).skip(skip).limit(parseInt(limit)),
      Resource.countDocuments(filter)
    ]);
    if (search) {
      await AnalyticsLog.create({
        eventType: 'search', userRole: 'student',
        academicLevel: req.user.academicLevel,
        searchQuery: search.substring(0, 100), resultCount: total
      }).catch(() => {});
    }
    return res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), resources });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get single resource
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('contributor', 'fullName role');
    if (!resource || !resource.isApproved) return res.status(404).json({ error: 'Resource not found' });
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    const isBookmarked = await Bookmark.findOne({ student: req.user._id, resource: req.params.id });
    return res.json({ success: true, resource, isBookmarked: !!isBookmarked });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Download
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isApproved) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Get original filename from GridFS metadata
    let originalName = resource.fileName;
    try {
      const fileInfo = await gridfsService.getFileInfo(resource.fileId.toString());
      if (fileInfo?.metadata?.originalName) {
        originalName = fileInfo.metadata.originalName;
      }
    } catch (e) {
      console.error('Could not get file info:', e.message);
    }

    // Set headers before streaming
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${originalName}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition'
    });

    const downloadStream = gridfsService.downloadFile(resource.fileId.toString());

    downloadStream.on('error', (err) => {
      console.error('GridFS stream error:', err);
      if (!res.headersSent) {
        res.status(404).json({ error: 'File not found in storage' });
      }
    });

    downloadStream.on('end', async () => {
      // Increment count and log only after successful stream
      await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
      await log({
        userId: req.user._id, userEmail: req.user.email, userRole: 'student',
        action: 'DOWNLOAD_RESOURCE', description: `Downloaded: ${resource.title}`,
        resourceId: resource._id, req
      }).catch(() => {});
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('DOWNLOAD ERROR:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
  }
};

// Bookmarks
const toggleBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({ student: req.user._id, resource: req.params.id });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.json({ success: true, bookmarked: false });
    }
    await Bookmark.create({ student: req.user._id, resource: req.params.id });
    return res.json({ success: true, bookmarked: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ student: req.user._id })
      .populate({ path: 'resource', populate: { path: 'contributor', select: 'fullName role' } })
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookmarks: bookmarks.filter(b => b.resource) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Resource requests
const createRequest = async (req, res) => {
  try {
    const { title, description, courseCode, academicLevel, resourceType } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const request = await ResourceRequest.create({
      requestedBy: req.user._id, title, description,
      courseCode, academicLevel, resourceType
    });
    return res.status(201).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ requestedBy: req.user._id })
      .sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard, getResources, getResource, downloadResource, toggleBookmark, getBookmarks, createRequest, getMyRequests };
