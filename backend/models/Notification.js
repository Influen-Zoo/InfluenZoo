const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['message', 'application', 'system', 'follow', 'like', 'save', 'comment', 'campaign'],
    default: 'system'
  },
  title: String,
  message: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure indices
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
