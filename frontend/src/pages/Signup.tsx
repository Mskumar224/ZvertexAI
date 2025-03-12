import React, { useState } from 'react';
import { Container, TextField, Button, Typography, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscription, setSubscription] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://zvertexai-orzv.onrender.com/api/signup', { email, password, subscription, phone });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (error: any) {
      alert('Signup failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Container className="glass-card" sx={{ mt: 5, py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>Signup</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" required />
        <TextField
          select
          label="Subscription"
          value={subscription}
          onChange={(e) => setSubscription(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="Student">Student</MenuItem>
          <MenuItem value="Vendor/Recruiter">Vendor/Recruiter</MenuItem>
          <MenuItem value="Business">Business</MenuItem>
        </TextField>
        <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth margin="normal" />
        <Button type="submit" variant="contained" sx={{ mt: 2, mr: 2, px: 4, py: 1.5 }}>Signup</Button>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, px: 4, py: 1.5, borderColor: '#007bff', color: '#007bff' }}>Back</Button>
      </form>
    </Container>
  );
};

export default Signup;