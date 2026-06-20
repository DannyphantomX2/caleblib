const User = require('../models/User');
const StudentRegistry = require('../models/StudentRegistry');
const Resource = require('../models/Resource');
const AuditLog = require('../models/AuditLog');
const Announcement = require('../models/Announcement');
const ResourceRequest = require('../models/ResourceRequest');
const Course = require('../models/Course');
const { log } = require('../utils/audit');

// ── DASHBOARD ──────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [
      totalStudents, totalStaff, totalResources,
      pendingResources, totalDownloads,
      recentUploads, recentAudit, pendingRequests
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      Resource.countDocuments({ isApproved: true, isArchived: false }),
      Resource.countDocuments({ isApproved: false, isArchived: false }),
      Resource.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      Resource.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5)
        .populate('contributor', 'fullName role'),
      AuditLog.find().sort({ createdAt: -1 }).limit(10)
        .populate('userId', 'fullName role'),
      ResourceRequest.countDocuments({ status: 'pending' })
    ]);

    return res.json({
      success: true,
      stats: {
        totalStudents, totalStaff, totalResources,
        pendingResources, pendingRequests,
        totalDownloads: totalDownloads[0]?.total || 0
      },
      recentUploads, recentAudit
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── STUDENT REGISTRY ───────────────────────────────────────────────────────
const seedStudent = async (req, res) => {
  try {
    const { fullName, email, matricNumber, academicLevel } = req.body;
    if (!fullName || !email || !matricNumber || !academicLevel) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const existing = await StudentRegistry.findOne({
      $or: [
        { matricNumber: matricNumber.toUpperCase() },
        { email: email.toLowerCase() }
      ]
    });
    if (existing) {
      return res.status(400).json({ error: 'Matric number or email already in registry' });
    }
    const entry = await StudentRegistry.create({
      fullName, email, matricNumber, academicLevel,
      addedBy: req.user._id
    });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'SEED_STUDENT',
      description: `Added ${fullName} (${matricNumber}) to registry`,
      req
    });
    return res.status(201).json({ success: true, entry });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const seedStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Provide an array of students' });
    }

    // Get existing matric numbers in one query
    const matrics = students.map(s => s.matricNumber).filter(Boolean);
    const existing = await StudentRegistry.find({ matricNumber: { $in: matrics } }).select('matricNumber');
    const existingSet = new Set(existing.map(e => e.matricNumber));

    // Filter out duplicates
    const toInsert = students
      .filter(s => s.matricNumber && !existingSet.has(s.matricNumber))
      .map(s => ({ ...s, addedBy: req.user._id }));

    let added = 0;
    if (toInsert.length > 0) {
      await StudentRegistry.insertMany(toInsert, { ordered: false });
      added = toInsert.length;
    }

    const skipped = students.length - added;

    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'SEED_STUDENT',
      description: `Bulk seeded ${added} students, skipped ${skipped} duplicates`,
      req
    });
    return res.json({ success: true, results: { added, skipped } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getRegistry = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, registered } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { matricNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (registered !== undefined) filter.isRegistered = registered === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [entries, total] = await Promise.all([
      StudentRegistry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      StudentRegistry.countDocuments(filter)
    ]);
    return res.json({ success: true, total, pages: Math.ceil(total / parseInt(limit)), entries });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteRegistryEntry = async (req, res) => {
  try {
    const entry = await StudentRegistry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Registry entry not found' });
    return res.json({ success: true, message: 'Registry entry deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── USER MANAGEMENT ────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search, suspended } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (suspended !== undefined) filter.isSuspended = suspended === 'true';
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { matricNumber: { $regex: search, $options: 'i' } }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);
    return res.json({ success: true, total, pages: Math.ceil(total / parseInt(limit)), users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Auto-generate sequential staff ID
    const allStaff = await User.find({ role: 'faculty' }).select('employeeId');
    let maxNum = 0;
    allStaff.forEach(s => {
      const match = s.employeeId?.match(/^CSC\/STAFF\/(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    const employeeId = 'CSC/STAFF/' + String(maxNum + 1).padStart(3, '0');

    const staff = await User.create({
      fullName, email, password,
      role: 'faculty', employeeId
    });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'CREATE_USER',
      description: `Created staff account: ${fullName} (${employeeId})`,
      req
    });
    return res.status(201).json({ success: true, user: staff });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspendedReason: reason || 'Suspended by administrator' },
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'SUSPEND_USER',
      description: `Suspended user ${user.email}: ${reason}`,
      req
    });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspendedReason: '' },
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'UPDATE_USER', description: `Unsuspended user ${user.email}`, req
    });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'DELETE_USER', description: `Deleted user ${user.email}`, req
    });
    return res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = newPassword;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'PASSWORD_CHANGED', description: `Reset password for ${user.email}`, req
    });
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── RESOURCE MANAGEMENT ────────────────────────────────────────────────────
const getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ isApproved: false, isArchived: false })
      .populate('contributor', 'fullName role matricNumber employeeId')
      .sort({ createdAt: -1 });
    return res.json({ success: true, total: resources.length, resources });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, approvedBy: req.user._id, approvedAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'APPROVE_RESOURCE', description: `Approved: ${resource.title}`,
      resourceId: resource._id, req
    });
    return res.json({ success: true, resource });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const rejectResource = async (req, res) => {
  try {
    const { reason } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, rejectionReason: reason || 'Rejected by administrator' },
      { returnDocument: 'after' }
    );
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'REJECT_RESOURCE', description: `Rejected: ${resource.title} — ${reason}`,
      resourceId: resource._id, req
    });
    return res.json({ success: true, resource });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'DELETE_RESOURCE', description: `Deleted: ${resource.title}`,
      resourceId: req.params.id, req
    });
    return res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── COURSES ────────────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const { level, semester } = req.query;
    const filter = {};
    if (level) filter.academicLevel = parseInt(level);
    if (semester) filter.semester = semester;
    const courses = await Course.find(filter).sort({ academicLevel: 1, code: 1 });
    return res.json({ success: true, courses });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { code, title, academicLevel, semester, units } = req.body;
    const course = await Course.create({ code, title, academicLevel, semester, units, createdBy: req.user._id });
    return res.status(201).json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetRole, isPinned } = req.body;
    const ann = await Announcement.create({
      title, content, targetRole, isPinned,
      createdBy: req.user._id
    });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'CREATE_ANNOUNCEMENT', description: `Created: ${title}`, req
    });
    return res.status(201).json({ success: true, announcement: ann });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { targetRole } = req.query;
    const filter = { isActive: true };
    if (targetRole) filter.$or = [{ targetRole }, { targetRole: 'all' }];
    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'fullName')
      .sort({ isPinned: -1, createdAt: -1 });
    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'DELETE_ANNOUNCEMENT', description: `Deleted announcement`, req
    });
    return res.json({ success: true, message: 'Announcement removed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── AUDIT LOGS ─────────────────────────────────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter)
    ]);
    await log({
      userId: req.user._id, userEmail: req.user.email, userRole: 'admin',
      action: 'VIEW_AUDIT_LOG', description: 'Viewed audit logs', req
    });
    return res.json({ success: true, total, pages: Math.ceil(total / parseInt(limit)), logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── ANALYTICS ──────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const [byLevel, byType, mostDownloaded, gaps] = await Promise.all([
      Resource.aggregate([
        { $match: { isApproved: true, isArchived: false } },
        { $group: { _id: '$academicLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Resource.aggregate([
        { $match: { isApproved: true, isArchived: false } },
        { $group: { _id: '$resourceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Resource.find({ isApproved: true, isArchived: false })
        .sort({ downloadCount: -1 }).limit(10)
        .select('title courseCode resourceType downloadCount averageRating'),
      Resource.aggregate([
        { $match: { isApproved: true, isArchived: false } },
        { $group: { _id: { courseCode: '$courseCode', academicLevel: '$academicLevel' }, count: { $sum: 1 }, courseTitle: { $first: '$courseTitle' } } },
        { $sort: { '_id.academicLevel': 1 } }
      ])
    ]);
    return res.json({ success: true, byLevel, byType, mostDownloaded, gaps });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ── REQUESTS ───────────────────────────────────────────────────────────────
const getRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await ResourceRequest.find(filter)
      .populate('requestedBy', 'fullName matricNumber academicLevel')
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 });
    return res.json({ success: true, total: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { status, assignedTo, adminNote } = req.body;
    const request = await ResourceRequest.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, adminNote },
      { returnDocument: 'after' }
    );
    return res.json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard, seedStudent, seedStudentsBulk, getRegistry,
  deleteRegistryEntry, getUsers, createStaff, suspendUser,
  unsuspendUser, deleteUser, resetUserPassword,
  getPendingResources, approveResource, rejectResource, deleteResource,
  getCourses, createCourse, deleteCourse,
  createAnnouncement, getAnnouncements, deleteAnnouncement,
  getAuditLogs, getAnalytics, getRequests, updateRequest
};
