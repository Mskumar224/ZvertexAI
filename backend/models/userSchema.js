const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  subscription: { type: String, enum: ['Student', 'Vendor/Recruiter', 'Business'], required: true },
  resumePaths: [String],
  selectedCompanies: [String],
  appliedJobs: [{ jobId: String, date: Date }],
  totalJobsApplied: { type: Number, default: 0 },
  phone: String,
  resetToken: String,
  resetTokenExpiry: Date,
  linkedinProfile: String,
  coverLetter: String,
  technology: String,
  signupComplete: { type: Boolean, default: false },
  paymentCompleted: { type: Boolean, default: false },
});

module.exports = userSchema;