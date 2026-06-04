const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please slow down.' }
});
app.use('/api/', globalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CalebLib API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Privacy policy endpoint
app.get('/api/privacy-policy', (req, res) => {
  res.json({
    lastUpdated: '2026-01-01',
    institution: 'Caleb University Computer Science Department',
    dataCollected: ['Name', 'Email', 'Matric Number', 'Usage logs'],
    dataPurpose: 'Academic resource management and system security',
    dataRetention: 'For the duration of enrollment plus 2 years',
    contact: 'cs.admin@calebuniversity.edu.ng'
  });
});

// Routes — separated by role
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admin', require('./routes/admin'));
// Legacy route disabled — use /api/student/resources instead
  // // Legacy route disabled — use role-specific routes instead
  // // Legacy route disabled
  // app.use('/api/resources', require('./routes/resources'));

// TEMP ROUTE (must be BEFORE 404)
const tempRouter = require('express').Router();
const User = require('./models/User');

tempRouter.post('/update-admin', async (req, res) => {
  const { secret, email, password } = req.body;

  if (secret !== 'caleb-update-2026') {
    return res.status(403).json({ error: 'No' });
  }

  const user = await User.findOne({ role: 'admin' });

  if (!user) {
    return res.status(404).json({ error: 'No admin found' });
  }

  user.email = email;
  user.password = password;

  await user.save();

  return res.json({
    success: true,
    email: user.email
  });
});

app.use('/api/temp', tempRouter);

// 404 handler (MUST be last)
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Error handler (MUST be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

module.exports = app;
