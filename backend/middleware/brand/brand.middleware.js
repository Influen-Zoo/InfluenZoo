const { roleMiddleware } = require('../auth/auth.middleware');

/**
 * Enforces brand-only access
 */
const brandOnly = roleMiddleware(['brand']);

module.exports = {
  brandOnly,
};
