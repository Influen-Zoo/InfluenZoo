const mongoose = require('mongoose');

const userWorkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'self-employed', 'freelance', 'contract', 'internship', 'seasonal'],
    },
    location: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    description: String,
    skills: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserWork', userWorkSchema);
