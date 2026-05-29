const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connectDB = require('../db');
const Inquiry = require('../models/Inquiry');

const sessions = new Map();

function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

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

  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
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

router.get('/me', (req, res) => {
  const token = req.cookies && req.cookies.session;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ authenticated: true });
});

router.get('/inquiries', async (req, res) => {
  const token = req.cookies && req.cookies.session;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    await connectDB();
    const inquiries = await Inquiry.find().sort({ submissionDate: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error("💥 Inquiries route error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
