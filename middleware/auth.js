const crypto = require('crypto');

const sessions = new Map();

function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.session;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

module.exports = { sessions, generateToken, requireAuth };
