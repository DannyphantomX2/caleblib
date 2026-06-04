const Resource = require('../models/Resource');
const Review = require('../models/Review');
const AnalyticsLog = require('../models/AnalyticsLog');
const gridfsService = require('../services/gridfsService');

// @desc    Upload a resource
// @route   POST /api/resources
// @access  Private
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      title, description, academicLevel, semester,
      courseCode, courseTitle, resourceType, tags,
      academicYear, projectDomain
    } = req.body;

    if (!title || !academicLevel || !semester || !courseCode || !resourceType) {
      return res.status(400).json({ error: 'title, academicLevel, semester, courseCode and resourceType are required' });
    }

    // Upload file to GridFS
    const fileData = await gridfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Faculty and admin resources auto-approved
    const isApproved = ['faculty', 'admin'].includes(req.user.role);

    const resource = await Resource.create({
      title,
      description,
      academicLevel: parseInt(academicLevel),
      semester,
      courseCode,
      courseTitle,
      resourceType,
      fileId: fileData.fileId,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      fileFormat: fileData.fileFormat,
      contributor: req.user._id,
      contributorRole: req.user.role,
      isApproved,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      academicYear,
      projectDomain: projectDomain || null,
      ...(isApproved && {
        approvedBy: req.user._id,
        approvedAt: new Date()
      })
    });

    // Log analytics event
    await AnalyticsLog.create({
      eventType: 'upload',
      userRole: req.user.role,
      academicLevel: req.user.academicLevel,
      resource: resource._id,
      courseCode,
      resourceType
    });

    return res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get all resources with filters
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const {
      academicLevel, semester, courseCode,
      resourceType, search, page = 1, limit = 20,
      sortBy = 'createdAt', order = 'desc'
    } = req.query;

    const filter = { isApproved: true, isArchived: false };

    if (academicLevel) filter.academicLevel = parseInt(academicLevel);
    if (semester) filter.semester = semester;
    if (courseCode) filter.courseCode = courseCode.toUpperCase();
    if (resourceType) filter.resourceType = resourceType;

    if (search) {
      filter.$text = { $search: search };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .populate('contributor', 'fullName role')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Resource.countDocuments(filter)
    ]);

    // Log search event
    if (search) {
      await AnalyticsLog.create({
        eventType: 'search',
        userRole: req.user.role,
        academicLevel: req.user.academicLevel,
        searchQuery: search.substring(0, 100),
        resultCount: total
      });
    }

    return res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      resources
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('contributor', 'fullName role')
      .populate('approvedBy', 'fullName');

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!resource.isApproved && req.user.role === 'student' &&
        resource.contributor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Resource not yet approved' });
    }

    await AnalyticsLog.create({
      eventType: 'view',
      userRole: req.user.role,
      academicLevel: req.user.academicLevel,
      resource: resource._id,
      courseCode: resource.courseCode,
      resourceType: resource.resourceType
    });

    return res.json({ success: true, resource });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Download a resource file
// @route   GET /api/resources/:id/download
// @access  Private
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!resource.isApproved) {
      return res.status(403).json({ error: 'Resource not yet approved' });
    }

    // Increment download count
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });

    await AnalyticsLog.create({
      eventType: 'download',
      userRole: req.user.role,
      academicLevel: req.user.academicLevel,
      resource: resource._id,
      courseCode: resource.courseCode,
      resourceType: resource.resourceType
    });

    const downloadStream = gridfsService.downloadFile(resource.fileId.toString());

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${resource.fileName}"`
    });

    downloadStream.on('error', () => {
      return res.status(404).json({ error: 'File not found in storage' });
    });

    downloadStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Approve a resource
// @route   PUT /api/resources/:id/approve
// @access  Private (faculty, admin)
const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, approvedBy: req.user._id, approvedAt: new Date() },
      { returnDocument: 'after' }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json({ success: true, resource });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Add a review
// @route   POST /api/resources/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ error: 'Rating is required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const existing = await Review.findOne({
      resource: req.params.id,
      reviewer: req.user._id
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this resource' });
    }

    const review = await Review.create({
      resource: req.params.id,
      reviewer: req.user._id,
      rating: parseInt(rating),
      comment
    });

    await AnalyticsLog.create({
      eventType: 'review',
      userRole: req.user.role,
      resource: resource._id,
      courseCode: resource.courseCode
    });

    return res.status(201).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get pending resources (admin/faculty)
// @route   GET /api/resources/pending
// @access  Private (faculty, admin)
const getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ isApproved: false, isArchived: false })
      .populate('contributor', 'fullName role matricNumber')
      .sort({ createdAt: -1 });

    return res.json({ success: true, total: resources.length, resources });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResource,
  downloadResource,
  approveResource,
  addReview,
  getPendingResources
};
