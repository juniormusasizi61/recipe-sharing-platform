/**
 * auth middleware
 * Verifies JWT passed in the `Authorization: Bearer <token>` header.
 * On success, attaches `req.user = { id, email }` and calls `next()`.
 * On failure, responds with 401 Unauthorized.
 */
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verify token using secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal user info to request for route handlers
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
