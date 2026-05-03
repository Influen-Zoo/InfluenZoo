const { verifyAccessToken } = require('../../utils/tokenUtils');
const User = require('../../models/User');

/**
 * Common Authentication Middleware
 * Verifies JWT and attaches userId and role to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('status');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'User is blocked' });
    }

    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Role Check Factory (Internal use)
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
};
