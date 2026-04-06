const jwt = require('jsonwebtoken');

// checks for a valid JWT, attaches decoded user to req.user
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// runs after verifyToken, blocks non-admins
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}

module.exports = { verifyToken, verifyAdmin };
