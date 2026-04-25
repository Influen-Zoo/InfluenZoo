const jwt = require('jsonwebtoken');
const { users } = require('../data/store');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'collabrix_super_secret_key_2024');
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

const brandOnly = (req, res, next) => {
  if (req.user.role !== 'brand') {
    return res.status(403).json({ error: 'Brand access required.' });
  }
  next();
};

const influencerOnly = (req, res, next) => {
  if (req.user.role !== 'influencer') {
    return res.status(403).json({ error: 'Influencer access required.' });
  }
  next();
};

module.exports = { auth, adminOnly, brandOnly, influencerOnly };
