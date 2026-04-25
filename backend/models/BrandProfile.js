const mongoose = require('mongoose');

const brandProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    logo: String,
    industry: String,
    website: String,
    companySize: String,
    foundedYear: Number,
    headquarters: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    hometown: String,
    about: String,
    socialLinks: {
      instagram: String,
      linkedin: String,
      twitter: String,
    },
    contactEmail: String,
    phone: String,
    campaignPreferences: {
      budgetRange: String,
      categories: [String],
    },
    pastHighlights: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BrandProfile', brandProfileSchema);
