const mongoose = require('mongoose');

const userEducationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    currentlyStudying: {
      type: Boolean,
      default: false,
    },
    description: String,
    grade: String,
    activities: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserEducation', userEducationSchema);
