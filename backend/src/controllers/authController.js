const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    console.log('Register hit with body:', req.body);
    
    const { fullName, email, password, role, matricNumber, academicLevel, employeeId } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide fullName, email, password and role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userData = { fullName, email, password, role };

    if (role === 'student') {
      userData.matricNumber = matricNumber;
      userData.academicLevel = academicLevel;
    }

    if (role === 'faculty' || role === 'admin') {
      userData.employeeId = employeeId;
    }

    console.log('Creating user with:', userData);
    const user = await User.create(userData);
    console.log('User created:', user._id);
    
    const token = generateToken(user._id);
    console.log('Token generated');

    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    return res.json({ success: true, token, user });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe };
