const express = require('express');
const categoryController = require('../../controllers/common/category.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { adminOnly } = require('../../middleware/admin/admin.middleware');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.put('/', authMiddleware, adminOnly, categoryController.updateCategories);

module.exports = router;
