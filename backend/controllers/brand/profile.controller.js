const BrandProfile = require('../../models/BrandProfile');
const User = require('../../models/User');
const { deleteUploadedFiles } = require('../../utils/uploadStorage');

const profileController = {
  getSelfProfile: async (req, res) => {
    try {
      let profile = await BrandProfile.findOne({ userId: req.userId });
      if (!profile) {
        // Return a default object if profile doesn't exist yet
        return res.json({ success: true, data: { userId: req.userId, isNew: true } });
      }
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getProfileById: async (req, res) => {
    try {
      const profile = await BrandProfile.findOne({ userId: req.params.id }).populate('userId', 'name role avatar banner');
      if (!profile) {
        return res.status(404).json({ error: 'Brand profile not found' });
      }
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Error fetching brand profile by id:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  createOrUpdateProfile: async (req, res) => {
    try {
      const updateData = req.body;
      
      // Ensure we don't overwrite crucial fields
      delete updateData.userId;

      const existingProfile = await BrandProfile.findOne({ userId: req.userId });
      const filesToDelete = [];
      if (updateData.logo && existingProfile?.logo && existingProfile.logo !== updateData.logo) {
        filesToDelete.push(existingProfile.logo);
      }

      let profile = await BrandProfile.findOneAndUpdate(
        { userId: req.userId },
        { ...updateData, userId: req.userId },
        { new: true, upsert: true, runValidators: true }
      );
      await deleteUploadedFiles(filesToDelete);

      // If brandName is provided, sync it with User.name for consistency if needed
      if (updateData.brandName) {
        await User.findByIdAndUpdate(req.userId, { name: updateData.brandName });
      }

      res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Error updating brand profile:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
};

module.exports = profileController;
