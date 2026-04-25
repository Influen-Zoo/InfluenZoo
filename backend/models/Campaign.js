const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const campaignSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['image', 'video', 'audio', 'gif'],
          required: true,
        },
      }
    ],
    tags: [{ type: String, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    // Campaign-specific fields
    budget: { type: Number, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    category: {
      type: String,
      enum: ['Fashion', 'Tech', 'Fitness', 'Beauty', 'Food', 'Travel', 'Other'],
    },
    requirements: { type: String, trim: true },
    deliverables: [{ type: String, trim: true }],
    compensation: {
      type: String,
      enum: ['paid', 'product', 'both'],
      default: 'paid',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'pending', 'rejected', 'draft'],
      default: 'pending',
    },
    platforms: [{ 
      type: String, 
      enum: ['Instagram', 'YouTube', 'Twitter', 'TikTok', 'Facebook', 'Other'],
      default: ['Other']
    }],
    platform: { type: String, default: 'Other' }, // Legacy single-platform support
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    coinCost: { type: Number, default: 0, min: 0 },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      default: 'Not meeting community standards',
    },
    blockedAt: {
      type: Date,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
