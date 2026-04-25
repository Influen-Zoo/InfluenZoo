const { roleMiddleware } = require('../auth/auth.middleware');

/**
 * Enforces influencer-only access
 */
const influencerOnly = roleMiddleware(['influencer']);

module.exports = {
  influencerOnly,
};
