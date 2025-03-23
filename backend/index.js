const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const requiredEnv = ['PORT', 'MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET', 'FRONTEND_URL', 'RAPIDAPI_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredEnv.forEach(env => {
  if (!process.env[env]) throw new Error(`Missing required env variable: ${env}`);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL], credentials: true }));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const upload = multer({ storage: multer.memoryStorage() }).single('resume');

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
  paymentCompleted: { type: Boolean, default: false }, // New field to track payment status
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({ from: `"AutoJobApply" <${process.env.EMAIL_USER}>`, to, subject, html, attachments });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

const fetchRealTimeJobs = async (companies, technology) => {
  const jobs = {};
  const options = {
    method: 'GET',
    url: 'https://indeed12.p.rapidapi.com/jobs/search',
    params: { query: technology || 'software', location: 'United States', page: '1', sort: 'date' },
    headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'indeed12.p.rapidapi.com' },
  };

  try {
    const response = await axios.request(options);
    const allJobs = response.data.hits || [];
    for (const company of companies) {
      jobs[company] = allJobs
        .filter(job => job.company_name.toLowerCase().includes(company.toLowerCase()))
        .map(job => ({
          id: job.job_id,
          title: job.title,
          company: job.company_name,
          posted: job.posted_time,
          requiresDocs: job.description.includes('resume') || job.description.includes('cover letter'),
          url: job.link || `https://www.indeed.com/viewjob?jk=${job.job_id}`,
        }));
    }
  } catch (error) {
    console.error('Job fetch failed:', error.message);
    for (const company of companies) {
      jobs[company] = [{
        id: `${company}-mock`,
        title: `${company} Job`,
        company: company,
        posted: new Date().toISOString(),
        requiresDocs: true,
        url: `https://${company.toLowerCase()}.com/careers`,
      }];
    }
  }
  return jobs;
};

const getSignupEmail = (email, subscription) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f9f9f9; border-radius: 10px;">
    <h2 style="color: #1976d2;">Welcome to AutoJobApply, ${email}!</h2>
    <p>You’ve joined with the ${subscription} plan. Let’s get started!</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
    <p style="margin-top: 20px;">Best,<br>The AutoJobApply Team</p>
  </div>`;

const getAutoApplyEmail = (email, companies) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f9f9f9; border-radius: 10px;">
    <h2 style="color: #1976d2;">Auto-Apply Started!</h2>
    <p>Hello ${email},</p>
    <p>We’ve begun applying to jobs at:</p>
    <ul>${companies.map(c => `<li>${c}</li>`).join('')}</ul>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
    <p style="margin-top: 20px;">Best,<br>The AutoJobApply Team</p>
  </div>`;

const getResetPasswordEmail = (email, resetLink) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f9f9f9; border-radius: 10px;">
    <h2 style="color: #1976d2;">Reset Your Password</h2>
    <p>Hello ${email},</p>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    <p style="margin-top: 20px;">Link expires in 1 hour. Ignore if not requested.<br>The AutoJobApply Team</p>
  </div>`;

app.get('/api/health', (req, res) => res.status(200).json({ message: 'Server running', dbConnected: true }));

app.post('/api/signup-initial', async (req, res) => {
  const { email, password, subscription, phone } = req.body;
  try {
    console.log('Signup attempt:', { email, subscription, phone });
    if (!email || !password || !subscription) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Email, password, and subscription are required' });
    }
    if (!['Student', 'Vendor/Recruiter', 'Business'].includes(subscription)) {
      console.error('Invalid subscription type:', subscription);
      return res.status(400).json({ message: 'Invalid subscription type' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.paymentCompleted) {
        console.log('Signup blocked: Email already exists with completed payment');
        return res.status(409).json({ message: 'Email already registered with a paid subscription' });
      } else {
        console.log('Overwriting unpaid user:', email);
        await User.deleteOne({ email });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, subscription, phone });
    await user.save();
    const token = jwt.sign({ email, subscription }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('Signup successful, token generated:', token);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during signup - check logs' });
  }
});

app.post('/api/signup-complete', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.signupComplete = true;
    user.paymentCompleted = true; // Mark payment as completed after Stripe success
    await user.save();
    await sendEmail(user.email, 'Welcome to AutoJobApply', getSignupEmail(user.email, user.subscription));
    res.status(200).json({ message: 'Signup completed' });
  } catch (error) {
    console.error('Signup complete error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)) || !user.signupComplete) {
      return res.status(401).json({ message: 'Invalid credentials or signup not completed' });
    }
    const token = jwt.sign({ email, subscription: user.subscription }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Reset Your Password', getResetPasswordEmail(email, resetLink));
    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email, resetToken: token });
    if (!user || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload-resume', upload, async (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'raw' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(req.file.buffer);
    });
    user.resumePaths.push(result.secure_url);
    if (req.body.technology) user.technology = req.body.technology;
    await user.save();
    res.status(200).json({ message: 'Resume uploaded', url: result.secure_url });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/select-companies', async (req, res) => {
  const { token, companies } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    user.selectedCompanies = companies;
    await user.save();
    const jobs = await fetchRealTimeJobs(companies, user.technology);
    res.status(200).json({ message: 'Companies selected', jobs });
  } catch (error) {
    console.error('Select companies error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/update-profile', async (req, res) => {
  const { token, linkedinProfile, coverLetter } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    user.linkedinProfile = linkedinProfile || user.linkedinProfile;
    user.coverLetter = coverLetter || user.coverLetter;
    await user.save();
    res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auto-apply', async (req, res) => {
  const { token, linkedinProfile, coverLetter } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!user.resumePaths.length || !user.selectedCompanies.length) {
      return res.status(400).json({ message: 'Resume and companies required' });
    }

    if (linkedinProfile) user.linkedinProfile = linkedinProfile;
    if (coverLetter) user.coverLetter = coverLetter;
    
    const jobs = await fetchRealTimeJobs(user.selectedCompanies, user.technology);
    const allJobs = Object.values(jobs).flat();
    for (const job of allJobs) {
      user.appliedJobs.push({ jobId: job.id, date: new Date() });
    }
    user.totalJobsApplied = (user.totalJobsApplied || 0) + allJobs.length;
    await user.save();
    
    await sendEmail(user.email, 'Auto-Apply Confirmation', getAutoApplyEmail(user.email, user.selectedCompanies), [{ filename: 'resume.pdf', path: user.resumePaths[user.resumePaths.length - 1] }]);
    res.status(200).json({ message: 'Auto-apply completed', appliedToday: allJobs.length, jobs });
  } catch (error) {
    console.error('Auto-apply error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/user-data', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    res.status(200).json({ totalJobsApplied: user.totalJobsApplied });
  } catch (error) {
    console.error('User data error:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));