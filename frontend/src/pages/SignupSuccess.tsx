import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Typography, Box, CircularProgress } from '@mui/material';

const SignupSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const completeSignup = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) {
        console.error('No token found in URL');
        navigate('/signup');
        return;
      }

      try {
        console.log('Completing signup with token:', token);
        await axios.post('http://localhost:5000/api/signup-complete', { token });
        console.log('Signup completed successfully');
        navigate('/dashboard'); // Adjust to your app’s dashboard route
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