const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const Announcement = require('../models/Announcement');
const AnalyticsLog = require('../models/AnalyticsLog');
const { log } = require('../utils/audit');
const gridfsService = require('../services/gridfsService');

// Dashboard
const getDashboard = async (req, res) => {
  try {
    const myResources = await Resource.find({
      contributor: req.user._id, isArchived: false
    });
    const totalDownloads = myResources.reduce((sum, r) => sum + r.downloadCount, 0);
    const totalViews = myResources.reduce((sum, r) => sum + (r.viewCount || 0), 0);
    const pendingApproval = myResources.filter(r => !r.isApproved).length;
    const approved = myResources.filter(r => r.isApproved).length;
    const requests = await ResourceRequest.countDocuments({ status: 'pending' });
    return res.json({
      success: true,
      stats: {
        totalUploads: myResources.length,
        approved, pendingApproval,
        totalDownloads, totalViews,
        openRequests: requests
      },
      recentUploads: myResources.sort((a,b) => b.createdAt - a.createdAt).slice(0, 5)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// My uploads
const getMyUploads = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [resources, total] = await Promise.all([
      Resource.find({ contributor: req.user._id, isArchived: false })
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Resource.countDocuments({ contributor: req.user._id, isArchived: false })
    ]);
    return res.json({ success: true, total, pages: Math.ceil(total / parseInt(limit)), resources });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Upload resource
const uploadResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const {
      title, description, academicLevel, semester,
      courseCode, courseTitle, resourceType, tags, academicYear
    } = req.body;
    if (!title || !academicLevel || !semester || !courseCode || !resourceType) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    const fileData = await gridfsService.uploadFile(
      req.file.buffer, req.file.originalname, req.file.mimetype
    );
    const resource = await Resource.create({
      title, description, academicLevel: parseInt(academicLevel),
      semester, courseCode: courseCode.toUpperCase(), courseTitle,
      resourceType, fileId: fileData.fileId, fileName: fileData.fileName,
      fileSize: fileData.fileSize, fileFormat: fileData.fileFormat,
      contributor: req.user._id, contributorRole: 'faculty',
      isApproved: true, approvedBy: req.user._id, approvedAt: new Date(),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      academicYear
    });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'faculty',
      action: 'UPLOAD_RESOURCE',
      description: `Uploaded: ${title} (${courseCode})`,
      resourceId: resource._id, req
    });
    return res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete own resource
const deleteMyResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      contributor: req.user._id
    });
    if (!resource) return res.status(404).json({ error: 'Resource not found or not yours' });
    try { await gridfsService.deleteFile(resource.fileId.toString()); } catch {}
    await Resource.findByIdAndDelete(req.params.id);
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'faculty',
      action: 'DELETE_RESOURCE', description: `Deleted own resource: ${resource.title}`,
      resourceId: req.params.id, req
    });
    return res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Resource requests
const getRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ status: { $in: ['pending', 'assigned'] } })
      .populate('requestedBy', 'fullName matricNumber academicLevel')
      .sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetRole } = req.body;
    const ann = await Announcement.create({
      title, content, targetRole: targetRole || 'student',
      createdBy: req.user._id
    });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'faculty',
      action: 'CREATE_ANNOUNCEMENT', description: `Created announcement: ${title}`, req
    });
    return res.status(201).json({ success: true, announcement: ann });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyAnalytics = async (req, res) => {
  try {
    const resources = await Resource.find({ contributor: req.user._id, isApproved: true })
      .select('title courseCode downloadCount viewCount averageRating reviewCount createdAt')
      .sort({ downloadCount: -1 });
    const totalDownloads = resources.reduce((s, r) => s + r.downloadCount, 0);
    const totalViews = resources.reduce((s, r) => s + (r.viewCount || 0), 0);
    return res.json({ success: true, resources, stats: { totalDownloads, totalViews, totalResources: resources.length } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard, getMyUploads, uploadResource, deleteMyResource, getRequests, createAnnouncement, getMyAnalytics };
