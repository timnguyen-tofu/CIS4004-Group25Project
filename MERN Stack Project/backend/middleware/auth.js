// ── Authentication Middleware ─────────────────────────────────
// These functions run before route handlers to check permissions.

const jwt = require('jsonwebtoken');

// verifyToken: checks that the request has a valid JWT token.
// If valid, it attaches the decoded user info to req.user.
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// verifyAdmin: runs after verifyToken to ensure the user is an admin.
// Standard users will be rejected with a 403 Forbidden response.
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin };
