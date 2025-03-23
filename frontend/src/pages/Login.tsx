import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="glass-card" sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Login</Typography>
      <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleLogin} disabled={loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Button onClick={() => navigate('/forgot-password')} variant="text">Forgot Password?</Button>
      <Button onClick={() => navigate('/signup')} variant="text">Need an account? Sign Up</Button>
    </Box>
  );
};

export default Login;