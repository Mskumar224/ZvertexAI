import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error: any) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: '100%' }}>
        <Typography variant="h1" align="center" gutterBottom>ZvertexAI</Typography>
        <Typography variant="h6" align="center" gutterBottom>Login</Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth variant="outlined" />
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            Login
          </Button>
          <Button variant="text" onClick={() => navigate('/signup')}>Need an account? Sign Up</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;