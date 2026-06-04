const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboard, seedStudent, seedStudentsBulk, getRegistry,
  deleteRegistryEntry, getUsers, createStaff, suspendUser,
  unsuspendUser, deleteUser, resetUserPassword,
  getPendingResources, approveResource, rejectResource, deleteResource,
  getCourses, createCourse, deleteCourse,
  createAnnouncement, getAnnouncements, deleteAnnouncement,
  getAuditLogs, getAnalytics, getRequests, updateRequest
} = require('../controllers/adminController');

router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Registry
router.post('/registry', seedStudent);
router.post('/registry/bulk', seedStudentsBulk);
router.get('/registry', getRegistry);
router.delete('/registry/:id', deleteRegistryEntry);

// Users
router.get('/users', getUsers);
router.post('/users/staff', createStaff);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetUserPassword);

// Resources
router.get('/resources/pending', getPendingResources);
router.put('/resources/:id/approve', approveResource);
router.put('/resources/:id/reject', rejectResource);
router.delete('/resources/:id', deleteResource);

// Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.delete('/courses/:id', deleteCourse);

// Announcements
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);

// Audit & Analytics
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);

// Requests
router.get('/requests', getRequests);
router.put('/requests/:id', updateRequest);

module.exports = router;
