const User = require('../models/User');
const Resource = require('../models/Resource');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { matricNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    return res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update user role or status
// @route   PUT /api/users/:id
// @access  Private (admin)
const updateUser = async (req, res) => {
  try {
    const { role, isActive, academicLevel } = req.body;
    const updates = {};

    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (academicLevel) updates.academicLevel = academicLevel;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get user's uploaded resources
// @route   GET /api/users/:id/resources
// @access  Private
const getUserResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      contributor: req.params.id,
      isArchived: false
    }).sort({ createdAt: -1 });

    return res.json({ success: true, total: resources.length, resources });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, academicLevel } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (academicLevel && req.user.role === 'student') updates.academicLevel = academicLevel;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser, getUserResources, updateProfile, changePassword };
