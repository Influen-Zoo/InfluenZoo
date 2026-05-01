const mongoose = require('mongoose');

const brandLogoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    image: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

brandLogoSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

module.exports = mongoose.model('BrandLogo', brandLogoSchema);
