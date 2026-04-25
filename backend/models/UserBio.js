const mongoose = require('mongoose');

const userBioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: Date,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
    relationshipStatus: {
      type: String,
      enum: ['single', 'relationship', 'married', 'divorced', 'widowed', 'not-specified'],
      default: 'not-specified',
    },
    hobbies: [String],
    interests: [String],
    languages: [String],
    website: String,
    about: String,
    hometown: String,
    currentCity: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    blueVerified: {
      type: Boolean,
      default: false,
    },
    pronouns: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserBio', userBioSchema);
