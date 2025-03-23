import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Typography, Box, CircularProgress } from '@mui/material';

const SignupSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/.netlify/functions/api' : 'http://localhost:5000/api';

  useEffect(() => {
    const completeSignup = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) {
        navigate('/signup');
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/signup-complete`, { token });
        navigate('/dashboard');
      } catch (error) {
        console.error('Signup completion error:', error);
        navigate('/signup');
      }
    };

    completeSignup();
  }, [navigate, location]);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Completing Signup...</Typography>
      <CircularProgress />
    </Box>
  );
};

export default SignupSuccess;