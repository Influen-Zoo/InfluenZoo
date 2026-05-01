const express = require('express');
const brandLogoController = require('../../controllers/admin/brandLogo.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { adminOnly } = require('../../middleware/admin/admin.middleware');

const router = express.Router();

router.get('/', brandLogoController.getPublicBrandLogos);
router.get('/settings', brandLogoController.getBrandLogoSettings);
router.put('/settings', authMiddleware, adminOnly, brandLogoController.updateBrandLogoSettings);

module.exports = router;
