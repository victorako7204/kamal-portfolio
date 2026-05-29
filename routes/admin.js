const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const Inquiry = require('../models/Inquiry');
const { sessions, generateToken, requireAuth } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken();
  sessions.set(token, { createdAt: Date.now() });

  const isVercel = process.env.VERCEL === '1';
  res.cookie('session', token, {
    httpOnly: true,
    secure: isVercel,
    sameSite: isVercel ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: 'Authenticated' });
});

router.post('/logout', (req, res) => {
  const token = req.cookies && req.cookies.session;
  if (token) {
    sessions.delete(token);
  }
  res.clearCookie('session', { path: '/' });
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ authenticated: true });
});

router.get('/inquiries', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const inquiries = await Inquiry.find({}, { briefData: 0 }).sort({ submissionDate: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error("💥 Inquiries route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
