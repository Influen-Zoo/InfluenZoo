const categoryService = require('../../services/common/category.service');

exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.updateCategories = async (req, res) => {
  try {
    const categories = await categoryService.updateCategories(req.body.categories);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update categories' });
  }
};
