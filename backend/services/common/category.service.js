const AppSetting = require('../../models/AppSetting');

const DEFAULT_CATEGORIES = ['Beauty', 'Fitness', 'Tech', 'Travel', 'Food', 'Fashion', 'Gaming', 'Lifestyle'];
const CATEGORY_SETTING_KEY = 'platform.categories';

const normalizeCategories = (categories = []) => {
  const categoryList = Array.isArray(categories)
    ? categories
    : String(categories || '').split(',');

  const seen = new Set();
  return categoryList
    .map((category) => String(category || '').trim())
    .filter(Boolean)
    .filter((category) => {
      const key = category.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const getCategories = async () => {
  const setting = await AppSetting.findOne({ key: CATEGORY_SETTING_KEY });
  const categories = normalizeCategories(setting?.value);
  return categories.length ? categories : DEFAULT_CATEGORIES;
};

const updateCategories = async (categories) => {
  const nextCategories = normalizeCategories(categories);
  if (!nextCategories.length) throw new Error('Please provide at least one category');

  await AppSetting.findOneAndUpdate(
    { key: CATEGORY_SETTING_KEY },
    {
      value: nextCategories,
      description: 'Admin-managed platform categories for profiles, campaigns, and filters'
    },
    { upsert: true }
  );

  return nextCategories;
};

module.exports = {
  DEFAULT_CATEGORIES,
  getCategories,
  updateCategories,
};
