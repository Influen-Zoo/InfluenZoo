const { roleMiddleware } = require('../auth/auth.middleware');

/**
 * Enforces admin-only access
 */
const adminOnly = roleMiddleware(['admin']);

module.exports = {
  adminOnly,
};
