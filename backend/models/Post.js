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

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
          required: true 
        }
      }
    ],
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    comments: [commentSchema],
    category: {
      type: String,
      default: 'General',
    },
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

module.exports = mongoose.model('Post', postSchema);
