import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscription, setSubscription] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await signup(email, password, subscription, phone);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error: any) {
      alert('Signup failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
        <Typography variant="h1" align="center" gutterBottom>ZvertexAI</Typography>
        <Typography variant="h6" align="center" gutterBottom>Sign Up</Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Subscription" value={subscription} onChange={(e) => setSubscription(e.target.value)} fullWidth variant="outlined" placeholder="Student, Vendor/Recruiter, Business" />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth variant="outlined" />
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            Sign Up
          </Button>
          <Button variant="text" onClick={() => navigate('/login')}>Already have an account? Login</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;