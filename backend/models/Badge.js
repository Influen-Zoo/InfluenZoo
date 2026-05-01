const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a badge name'],
      trim: true,
      unique: true,
    },
    icon: {
      type: String, // Can be a Lucide icon name or a URL for a custom image
      required: [true, 'Please provide an icon or image URL'],
    },
    isCustomIcon: {
      type: Boolean,
      default: false, // True if icon is a URL to an uploaded image
    },
    color: {
      type: String,
      default: '#var(--accent)', // Default to theme accent
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
