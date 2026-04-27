const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const socialMediaAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'youtube'],
      required: true,
    },
    accountId: String,
    accountName: String,
    accountUrl: String,
    followers: {
      type: Number,
      default: 0,
    },
    subscribers: {
      type: Number,
      default: 0,
    },
    posts: {
      type: Number,
      default: 0,
    },
    videos: {
      type: Number,
      default: 0,
    },
    lastSyncedAt: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['influencer', 'brand', 'admin'],
      default: 'influencer',
    },
    bio: String,
    avatar: String,
    banner: String,
    location: String,
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    socialLinks: {
      instagram: String,
      tiktok: String,
      youtube: String,
      twitter: String,
      facebook: String,
    },
    socialMediaAccounts: [socialMediaAccountSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
    category: String, // For influencers: Fashion, Tech, Fitness, etc.
    engagement: {
      type: Number,
      default: 0,
    },
    niche: [String],
    refreshToken: String,
    lastLogin: Date,
    coins: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    userBio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserBio',
    },
    education: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserEducation',
    }],
    work: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserWork',
    }],
    savedCampaigns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
