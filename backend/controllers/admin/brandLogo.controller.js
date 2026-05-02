const BrandLogo = require('../../models/BrandLogo');
const AppSetting = require('../../models/AppSetting');
const { getUploadUrl, deleteUploadedFile } = require('../../utils/uploadStorage');

const normalizeLogo = (logo) => ({
  _id: logo._id,
  name: logo.name,
  image: logo.image,
  website: logo.website,
  sortOrder: logo.sortOrder,
  isActive: logo.isActive,
  createdAt: logo.createdAt,
  updatedAt: logo.updatedAt,
});

exports.getPublicBrandLogos = async (req, res) => {
  try {
    const logos = await BrandLogo.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: logos });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAdminBrandLogos = async (req, res) => {
  try {
    const logos = await BrandLogo.find()
      .sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: logos.map(normalizeLogo) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createBrandLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a transparent PNG logo' });
    }

    const logo = await BrandLogo.create({
      name: req.body.name,
      website: req.body.website || '',
      sortOrder: Number(req.body.sortOrder || 0),
      isActive: req.body.isActive !== 'false',
      image: getUploadUrl(req.file),
    });

    res.status(201).json({ success: true, data: normalizeLogo(logo) });
  } catch (error) {
    if (req.file) {
      await deleteUploadedFile(getUploadUrl(req.file));
    }
    res.status(400).json({ error: error.message || 'Could not create brand logo' });
  }
};

exports.updateBrandLogo = async (req, res) => {
  try {
    const update = {
      name: req.body.name,
      website: req.body.website || '',
      sortOrder: Number(req.body.sortOrder || 0),
      isActive: req.body.isActive !== 'false',
    };

    const existingLogo = await BrandLogo.findById(req.params.id);
    if (!existingLogo) return res.status(404).json({ error: 'Brand logo not found' });

    if (req.file) {
      update.image = getUploadUrl(req.file);
    }

    const logo = await BrandLogo.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (req.file && existingLogo.image !== update.image) {
      await deleteUploadedFile(existingLogo.image);
    }
    res.json({ success: true, data: normalizeLogo(logo) });
  } catch (error) {
    if (req.file) {
      await deleteUploadedFile(getUploadUrl(req.file));
    }
    res.status(400).json({ error: error.message || 'Could not update brand logo' });
  }
};

exports.deleteBrandLogo = async (req, res) => {
  try {
    const logo = await BrandLogo.findByIdAndDelete(req.params.id);
    if (!logo) return res.status(404).json({ error: 'Brand logo not found' });
    await deleteUploadedFile(logo.image);
    res.json({ success: true, data: normalizeLogo(logo) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBrandLogoSettings = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ key: 'brand_logo_settings' });
    
    // Default settings
    const defaults = {
      scrollSpeed: 18,
      spacing: 40,
      showSeparator: false
    };

    let finalData = defaults;

    if (!setting) {
      // Check for legacy scroll speed setting
      const legacy = await AppSetting.findOne({ key: 'brand_logo_scroll_speed' });
      if (legacy) {
        defaults.scrollSpeed = Number(legacy.value);
      }
      finalData = defaults;
    } else {
      finalData = { ...defaults, ...setting.value };
    }
    
    console.log('GET Brand Logo Settings:', finalData);
    res.json({ success: true, data: finalData });
  } catch (error) {
    console.error('GET Brand Logo Settings Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateBrandLogoSettings = async (req, res) => {
  try {
    const { scrollSpeed, spacing, showSeparator } = req.body;
    
    const newValue = {
      scrollSpeed: scrollSpeed ?? 18,
      spacing: spacing ?? 40,
      showSeparator: !!showSeparator
    };

    console.log('UPDATE Brand Logo Settings Request:', newValue);

    const setting = await AppSetting.findOneAndUpdate(
      { key: 'brand_logo_settings' },
      { 
        value: newValue,
        description: 'Combined settings for brand logo carousel (speed, spacing, separator)'
      },
      { upsert: true, new: true }
    );

    console.log('UPDATE Brand Logo Settings Saved:', setting.value);
    res.json({ success: true, data: setting.value });
  } catch (error) {
    console.error('UPDATE Brand Logo Settings Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
