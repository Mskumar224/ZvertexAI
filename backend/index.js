const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
}).single('resume');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  subscription: { type: String, enum: ['Student', 'Vendor', 'Business'], required: true },
  resumes: { type: Number, default: 5 }, // Changed default to 5
  jobsPerDay: { type: Number, default: 45 },
  recruiters: { type: Number, default: 1 },
  resumePaths: [String],
  selectedCompanies: [{ company: String, resumePath: String }],
  appliedJobs: [{ jobId: String, company: String, resumePath: String, date: Date }],
  phone: String,
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const scanResume = (resumePath) => ['Add more technical skills', 'Update recent experience'];
const updateResume = (resumePath, prompt) => resumePath;

const fetchJobs = async (companies) => {
  try {
    const jobs = {};
    for (const company of companies) {
      const response = await axios.get(`https://jobs.github.com/positions.json?search=${company}`);
      jobs[company] = response.data.slice(0, 2).map(job => ({
        id: job.id,
        title: job.title,
        posted: job.created_at,
        location: job.location || 'Remote',
        requiresDocs: Math.random() > 0.7,
        company: job.company || company,
      }));
    }
    return jobs;
  } catch (error) {
    console.error('Job fetch error:', error.message);
    return companies.reduce((acc, company) => ({
      ...acc,
      [company]: [
        { id: `${company}-1`, title: `${company} - Software Engineer`, posted: new Date().toISOString(), location: 'Remote', requiresDocs: false, company },
        { id: `${company}-2`, title: `${company} - Data Analyst`, posted: new Date().toISOString(), location: 'Remote', requiresDocs: false, company },
      ],
    }), {});
  }
};

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: `"ZvertexAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

const getSignupEmail = (email, subscription) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: #007bff;">Welcome to ZvertexAI, ${email}!</h2>
    <p>We’re thrilled to have you join us with your ${subscription} plan!</p>
    <p>Get started by uploading your resume and selecting your target companies!</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Dashboard</a>
  </div>
`;

const getAutoApplyEmail = (email, subscription, jobTitle, company, location, resumePath, requiresDocs = false, manualRequirements = '') => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: #007bff;">${requiresDocs ? 'Action Required' : 'Auto-Apply Confirmation'}</h2>
    <p>Dear ${email},</p>
    ${
      requiresDocs ?
      `<p><strong>${jobTitle}</strong> at ${company} (${location}) requires additional steps:</p>
       <p><strong>Requirements:</strong> ${manualRequirements}</p>` :
      `<p>Your resume has been auto-applied to:</p>
       <p><strong>Position:</strong> ${jobTitle}<br><strong>Company:</strong> ${company}<br><strong>Location:</strong> ${location}</p>
       <p>Attached resume: ${resumePath.split('/').pop()}</p>`
    }
    <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
  </div>
`;

app.post('/api/signup', async (req, res) => {
  const { email, password, subscription, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      subscription,
      phone,
      resumes: 5, // Set to 5 for all new users
      jobsPerDay: subscription === 'Student' ? 45 : 35,
      recruiters: subscription === 'Business' ? 2 : 1,
    });
    await user.save();
    const token = jwt.sign({ email, subscription }, process.env.JWT_SECRET, { expiresIn: '1h' });
    sendEmail(email, 'Welcome to ZvertexAI', getSignupEmail(email, subscription));
    res.status(201).json({ token, message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email, subscription: user.subscription }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/upload-resume', upload, async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (user.resumePaths.length >= 5) { // Check against fixed limit of 5
      return res.status(403).json({ 
        message: 'Resume limit reached (5). Upgrade your subscription for more uploads.',
        subscriptionRequired: true 
      });
    }
    user.resumePaths.push(req.file.path);
    await user.save();
    const suggestions = scanResume(req.file.path);
    res.status(200).json({ message: 'Resume uploaded', path: req.file.path, suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

app.post('/api/update-resume', async (req, res) => {
  const { token, resumePath, prompt } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user.resumePaths.includes(resumePath)) return res.status(403).json({ message: 'Invalid resume path' });
    const updatedPath = updateResume(resumePath, prompt);
    res.status(200).json({ message: 'Resume updated', newPath: updatedPath });
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

app.post('/api/select-companies', async (req, res) => {
  const { token, companyResumeMap } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (companyResumeMap.length > 12) return res.status(400).json({ message: 'Maximum 12 companies allowed' });
    user.selectedCompanies = companyResumeMap;
    await user.save();
    const companies = companyResumeMap.map(item => item.company);
    const jobs = await fetchJobs(companies);
    res.status(200).json({ message: 'Companies selected', jobs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to select companies' });
  }
});

app.post('/api/confirm-auto-apply', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user.resumePaths.length || !user.selectedCompanies.length) {
      return res.status(400).json({ message: 'Upload resume and select companies first' });
    }
    const companies = user.selectedCompanies.map(item => item.company);
    const jobs = await fetchJobs(companies);
    res.status(200).json({ message: 'Auto-apply confirmed', jobs });
  } catch (error) {
    res.status(500).json({ message: 'Confirmation failed' });
  }
});

app.post('/api/auto-apply', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    const today = new Date().toDateString();
    const appliedToday = user.appliedJobs.filter(job => new Date(job.date).toDateString() === today).length;
    if (appliedToday >= user.jobsPerDay) return res.status(403).json({ message: 'Daily job apply limit reached' });
    
    const companies = user.selectedCompanies.map(item => item.company);
    const jobs = await fetchJobs(companies);
    const allJobs = Object.values(jobs).flat();

    for (const job of allJobs) {
      const companyResume = user.selectedCompanies.find(item => item.company === job.company);
      const resumePath = companyResume?.resumePath;
      const resumeAttachment = resumePath && fs.existsSync(resumePath) ? [{
        filename: resumePath.split('/').pop(),
        path: resumePath,
      }] : [];

      if (job.requiresDocs) {
        const requirements = 'Cover letter and certifications required.';
        sendEmail(user.email, 'Manual Action Required - ZvertexAI', getAutoApplyEmail(user.email, user.subscription, job.title, job.company, job.location, resumePath, true, requirements));
      } else {
        user.appliedJobs.push({ jobId: job.id, company: job.company, resumePath, date: new Date() });
        sendEmail(
          user.email,
          'Auto-Apply Confirmation - ZvertexAI',
          getAutoApplyEmail(user.email, user.subscription, job.title, job.company, job.location, resumePath),
          resumeAttachment
        );
      }
    }
    await user.save();
    res.status(200).json({ message: 'Auto-apply process completed' });
  } catch (error) {
    res.status(500).json({ message: 'Auto-apply failed' });
  }
});

app.get('/api/user-data', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      selectedCompanies: user.selectedCompanies,
      appliedJobs: user.appliedJobs,
      resumePaths: user.resumePaths,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`Server running on port ${port}`));