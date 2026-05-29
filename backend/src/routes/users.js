const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserResources,
  updateProfile,
  changePassword
} = require('../controllers/userController');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/profile/me', protect, updateProfile);
router.put('/profile/password', protect, changePassword);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.get('/:id/resources', protect, getUserResources);

module.exports = router;
