const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../utils/db'); // Helper to connect to MongoDB

exports.handler = async (event, context) => {
  await connectDB();
  const { email, password, subscription, phone } = JSON.parse(event.body);

  try {
    if (!email || !password || !subscription) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email, password, and subscription are required' }) };
    }
    if (!['Student', 'Vendor/Recruiter', 'Business'].includes(subscription)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid subscription type' }) };
    }

    const User = mongoose.model('User', require('../models/userSchema'));
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.paymentCompleted) {
        return { statusCode: 409, body: JSON.stringify({ message: 'Email already registered with a paid subscription' }) };
      } else {
        await User.deleteOne({ email });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, subscription, phone });
    await user.save();
    const token = jwt.sign({ email, subscription }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return { statusCode: 201, body: JSON.stringify({ token }) };
  } catch (error) {
    console.error('Signup error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error during signup' }) };
  }
};