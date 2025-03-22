const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');

dotenv.config();

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Cloudinary configuration failed:', error.message);
}

const requiredEnv = ['PORT', 'MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET', 'FRONTEND_URL', 'RAPIDAPI_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredEnv.forEach((env) => {
  if (!process.env[env]) throw new Error(`Missing required env variable: ${env}`);
});

console.log('Starting backend server...', {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  EMAIL_USER: process.env.EMAIL_USER,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:3000',
  'https://zvertexai.netlify.app',
  'https://67d1e078ce70580008045c8d--zvertexai.netlify.app',
  'https://67d1e69e2d47412a5001c924--zvertexai.netlify.app',
  'https://67d1e9046704b12e711ef0b1--zvertexai.netlify.app',
  'https://67dee93e84153f00085d1754--zvertexai.netlify.app', // Added new Netlify URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS rejected origin: ${origin}`);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

let dbConnected = false;
const connectToMongoDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      dbConnected = true;
      console.log('Connected to MongoDB successfully');
      break;
    } catch (err) {
      console.error(`MongoDB connection attempt failed (retries left: ${retries}):`, err.message, err.stack);
      retries--;
      if (retries === 0) {
        console.error('MongoDB connection exhausted retries.');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
connectToMongoDB();

const upload = multer({ storage: multer.memoryStorage() }).single('resume');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  subscription: { type: String, enum: ['Student', 'Vendor/Recruiter', 'Business'], required: true },
  plan: { type: String, enum: ['Basic', 'Unlimited'], default: 'Basic' },
  resumePaths: [String],
  selectedCompanies: [String],
  appliedJobs: [{ jobId: String, date: Date }],
  phone: String,
  resetToken: String,
  resetTokenExpiry: Date,
  linkedinProfile: String,
  coverLetter: String,
  technology: String,
});
const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
transporter.verify((error) => {
  if (error) console.error('Nodemailer setup failed:', error.message);
  else console.log('Nodemailer configured successfully');
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const scanResume = (resumePath) => ['Add more technical skills', 'Update recent experience'];
const updateResume = (resumePath, prompt) => resumePath;

const extractTechnologies = async (resumeBuffer) => {
  try {
    const data = await pdfParse(resumeBuffer);
    const text = data.text.toLowerCase();
    const techKeywords = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'typescript', 'aws', 'docker', 'kotlin'];
    const foundTech = techKeywords.filter(tech => text.includes(tech));
    return foundTech.length > 0 ? foundTech.join(', ') : null;
  } catch (error) {
    console.error('Technology extraction failed:', error.message);
    return null;
  }
};

const fetchRealTimeJobs = async (companies, technology, retries = 3) => {
  const jobs = {};
  const indeedOptions = {
    method: 'GET',
    url: 'https://indeed12.p.rapidapi.com/jobs/search',
    params: { query: technology || 'software', location: 'United States', page: '1', sort: 'date' },
    headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'indeed12.p.rapidapi.com' },
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Fetching jobs for ${companies.length} companies at ${new Date().toISOString()} - Attempt ${attempt + 1}`);
      const response = await axios.request(indeedOptions);
      const allJobs = response.data.hits || [];
      for (const company of companies) {
        const companyJobs = allJobs
          .filter(job => job.company_name.toLowerCase().includes(company.toLowerCase()))
          .map(job => ({
            id: job.job_id,
            title: job.title,
            posted: job.posted_time,
            requiresDocs: job.description.includes('resume') || job.description.includes('cover letter'),
            url: job.link || `https://www.indeed.com/viewjob?jk=${job.job_id}`,
          }));
        jobs[company] = companyJobs.length > 0 ? companyJobs : [];
      }
      for (const company of companies) {
        if (!jobs[company] || jobs[company].length === 0) {
          console.log(`No jobs found for ${company}, using mock data`);
          jobs[company] = [{
            id: `${company}-mock-1`,
            title: `${company} - ${technology || 'Software'} Engineer`,
            posted: new Date().toISOString(),
            requiresDocs: true,
            url: `https://${company.toLowerCase()}.com/careers`,
          }];
        }
      }
      return jobs;
    } catch (error) {
      console.error(`Indeed API attempt ${attempt + 1} failed:`, error.response?.status, error.message);
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || (attempt + 1) * 5;
        console.log(`Rate limited (429), waiting ${retryAfter} seconds`);
        await delay(retryAfter * 1000);
      } else if (error.response?.status === 403) {
        console.error('Forbidden (403): Check RAPIDAPI_KEY');
        break;
      } else if (attempt === retries - 1) {
        console.error('Max retries reached, using mock data');
        for (const company of companies) {
          jobs[company] = [{
            id: `${company}-mock-1`,
            title: `${company} - ${technology || 'Software'} Engineer`,
            posted: new Date().toISOString(),
            requiresDocs: true,
            url: `https://${company.toLowerCase()}.com/careers`,
          }];
        }
        return jobs;
      }
    }
  }
  return jobs;
};

const autoApplyToJob = async (job, user) => {
  console.log(`Auto-applying to ${job.title} at ${job.url} for ${user.email}`);
  console.log(`Using resume: ${user.resumePaths[user.resumePaths.length - 1]}`);
  if (job.requiresDocs) {
    console.log(`Using LinkedIn: ${user.linkedinProfile}, Cover Letter: ${user.coverLetter}`);
  }
  return true;
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
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};

const getSignupEmail = (email, subscription) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #00C4B4;">Welcome to ZvertexAI, ${email}!</h2>
    <p>We’re thrilled to have you on board with your ${subscription} plan.</p>
    <p>Get started by uploading your resume and selecting companies to auto-apply to!</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #00C4B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    <p>Best regards,<br>The ZvertexAI Team</p>
  </div>`;

const getAutoApplyEmail = (email, subscription, companies) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #00C4B4;">Auto-Apply Activated!</h2>
    <p>Hello ${email},</p>
    <p>Your auto-apply process is now active for the following companies:</p>
    <ul>${companies.map(c => `<li>${c}</li>`).join('')}</ul>
    <p>We'll apply your resume to relevant jobs daily. Track your applications in the dashboard.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #00C4B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
    <p>Best regards,<br>The ZvertexAI Team</p>
  </div>`;

const getResetPasswordEmail = (email, resetLink) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #00C4B4;">Reset Your Password</h2>
    <p>Hello ${email},</p>
    <p>We received a request to reset your password. Click the link below to reset it:</p>
    <a href="${resetLink}" style="background-color: #00C4B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link expires in 1 hour. If you didn’t request this, ignore this email.</p>
    <p>Best regards,<br>The ZvertexAI Team</p>
  </div>`;

app.get('/api/health', (req, res) => res.status(200).json({ message: 'Server is running', dbConnected }));

app.post('/api/signup', async (req, res) => {
  const { email, password, subscription, phone } = req.body;
  try {
    if (!dbConnected) throw new Error('Database not connected');
    if (!email || !password || !subscription) return res.status(400).json({ message: 'Missing required fields' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, subscription, phone });
    await user.save();
    const token = jwt.sign({ email, subscription }, process.env.JWT_SECRET, { expiresIn: '24h' });
    await sendEmail(email, 'Welcome to ZvertexAI', getSignupEmail(email, subscription));
    res.status(201).json({ token, message: 'Signup successful' });
  } catch (error) {
    console.error('Signup error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!dbConnected) throw new Error('Database not connected');
    if (!email || !password) return res.status(400).json({ message: 'Missing required fields' });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email, subscription: user.subscription }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    if (!dbConnected) throw new Error('Database not connected');
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'Reset Your Password - ZvertexAI', getResetPasswordEmail(email, resetLink));
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!dbConnected) throw new Error('Database not connected');
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
    console.error('Reset password error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

app.post('/api/upload-resume', upload, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ message: 'Service unavailable: Database not connected' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!req.body.token) return res.status(400).json({ message: 'Token missing' });

    let decoded;
    try {
      decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed in /api/upload-resume:', jwtError.message);
      return res.status(401).json({ message: 'Token expired or invalid', error: jwtError.message });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });

    let result;
    try {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'raw' },
          (error, result) => {
            if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
            resolve(result);
          }
        ).end(req.file.buffer);
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError.message);
      return res.status(500).json({ message: 'Failed to upload to Cloudinary', error: cloudinaryError.message });
    }

    user.resumePaths.push(result.secure_url);
    const extractedTech = await extractTechnologies(req.file.buffer);
    if (req.body.technology) {
      user.technology = req.body.technology;
    } else if (extractedTech) {
      user.technology = extractedTech;
    }
    await user.save();

    const suggestions = scanResume(result.secure_url);
    res.status(200).json({ 
      message: 'Resume uploaded', 
      path: result.secure_url, 
      suggestions, 
      technology: user.technology || null 
    });
  } catch (error) {
    console.error('Upload resume error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

app.post('/api/select-companies', async (req, res) => {
  const { token, companies } = req.body;
  try {
    if (!dbConnected) return res.status(503).json({ message: 'Service unavailable: Database not connected' });
    if (!token || !companies) return res.status(400).json({ message: 'Missing token or companies' });
    if (companies.length > 10) return res.status(400).json({ message: 'Maximum 10 companies allowed' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed in /api/select-companies:', jwtError.message);
      return res.status(401).json({ message: 'Token expired or invalid', error: jwtError.message });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });

    user.selectedCompanies = companies;
    await user.save();

    const jobs = await fetchRealTimeJobs(companies, user.technology);
    res.status(200).json({ message: 'Companies selected', jobs });
  } catch (error) {
    console.error('Select companies error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to select companies', error: error.message });
  }
});

app.post('/api/update-profile', async (req, res) => {
  const { token, linkedinProfile, coverLetter } = req.body;
  try {
    if (!dbConnected) return res.status(503).json({ message: 'Service unavailable: Database not connected' });
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed in /api/update-profile:', jwtError.message);
      return res.status(401).json({ message: 'Token expired or invalid', error: jwtError.message });
    }

    const user = await User.findOne({ email: decoded.email });
    user.linkedinProfile = linkedinProfile || user.linkedinProfile;
    user.coverLetter = coverLetter || user.coverLetter;
    await user.save();
    res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Profile update error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

app.post('/api/auto-apply', async (req, res) => {
  const { token, linkedinProfile, coverLetter } = req.body;
  try {
    if (!dbConnected) return res.status(503).json({ message: 'Service unavailable: Database not connected' });
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed in /api/auto-apply:', jwtError.message);
      return res.status(401).json({ message: 'Token expired or invalid', error: jwtError.message });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (!user.resumePaths.length || !user.selectedCompanies.length) {
      return res.status(400).json({ message: 'Upload resume and select companies first' });
    }

    if (linkedinProfile) user.linkedinProfile = linkedinProfile;
    if (coverLetter) user.coverLetter = coverLetter;
    await user.save();

    const today = new Date().toDateString();
    const appliedToday = user.appliedJobs.filter(job => new Date(job.date).toDateString() === today).length;
    const jobs = await fetchRealTimeJobs(user.selectedCompanies, user.technology);
    const allJobs = Object.values(jobs).flat();

    const missingInfo = allJobs.some(job => job.requiresDocs && (!user.linkedinProfile || !user.coverLetter));
    if (missingInfo) {
      return res.status(400).json({
        message: 'Additional information required',
        requires: { linkedin: !user.linkedinProfile, coverLetter: !user.coverLetter },
      });
    }

    let appliedCount = 0;
    for (const job of allJobs) {
      const success = await autoApplyToJob(job, user);
      if (success) {
        user.appliedJobs.push({ jobId: job.id, date: new Date() });
        appliedCount++;
      }
      await delay(1000);
    }
    await user.save();

    const resumePath = user.resumePaths[user.resumePaths.length - 1];
    const attachments = [{ filename: 'resume.pdf', path: resumePath }];
    await sendEmail(user.email, 'Auto-Apply Activated - ZvertexAI', getAutoApplyEmail(user.email, user.subscription, user.selectedCompanies), attachments);

    res.status(200).json({ message: 'Auto-apply process completed', appliedToday: appliedToday + appliedCount });
  } catch (error) {
    console.error('Auto-apply error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Auto-apply failed', error: error.message });
  }
});

const port = process.env.PORT || 5002;
app.listen(port, () => console.log(`Server running on port ${port}`))
  .on('error', (err) => console.error('Server startup failed:', err.message));