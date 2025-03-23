import React, { useState } from 'react';
import { Button, TextField, Typography, Box, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

type SubscriptionType = 'Student' | 'Vendor/Recruiter' | 'Business';
interface SubscriptionPlan { price: number; priceId: string }
// Define the subscription plans with explicit typing
const subscriptionPlans: Record<SubscriptionType, SubscriptionPlan> = {
  'Student': { price: 39, priceId: 'price_1R5dNP2MVJL42o0CLvjkMHzz' }, // Replace with your actual Stripe Price ID
  'Vendor/Recruiter': { price: 79, priceId: 'price_1R5dOA2MVJL42o0CzqZFoxrY' }, // Replace with your actual Stripe Price ID
  'Business': { price: 149, priceId: 'price_1R5dOh2MVJL42o0CcxilmPBq' } // Replace with your actual Stripe Price ID
};

const stripePromise = loadStripe('pk_test_51R0u7t2MVJL42o0CFAiu0ubCD41G0TdoaHp209InzDyqEwhhA8VEWACerz6oueeGHb4Dd1YppKuk4By8etJN3VnY00wM38IYbh'); // Replace with your actual Stripe publishable key

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/.netlify/functions' : 'http://localhost:5000/api';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionType | ''>('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!subscription) {
      setError('Please select a subscription plan');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/signup-initial`, { email, password, subscription, phone });
      const token = res.data.token;

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');
      const { error: stripeError } = await stripe.redirectToCheckout({
        lineItems: [{ price: subscriptionPlans[subscription].priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/signup-success?token=${token}`,
        cancelUrl: `${window.location.origin}/signup`,
        customerEmail: email,
      });

      if (stripeError) throw new Error(stripeError.message);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <Box className="glass-card" sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Sign Up</Typography>
      <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField
        select
        label="Plan"
        value={subscription}
        onChange={e => setSubscription(e.target.value as SubscriptionType)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="Student">Student ($39/month)</MenuItem>
        <MenuItem value="Vendor/Recruiter">Vendor/Recruiter ($79/month)</MenuItem>
        <MenuItem value="Business">Business ($149/month)</MenuItem>
      </TextField>
      <TextField label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleSignup} disabled={loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Proceed to Payment'}
      </Button>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Button onClick={() => navigate('/login')} variant="text">Already have an account? Login</Button>
    </Box>
  );
};

export default Signup;