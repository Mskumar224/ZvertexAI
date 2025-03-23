import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" gutterBottom>AutoJobApply</Typography>
      {token ? (
        <>
          <Button variant="contained" onClick={() => navigate('/resume-upload')} sx={{ m: 1 }}>
            Upload Resume
          </Button>
          <Button variant="contained" onClick={() => navigate('/companies')} sx={{ m: 1 }}>
            Select Companies
          </Button>
          <Button variant="contained" onClick={handleLogout} sx={{ m: 1 }}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ m: 1 }}>
            Login
          </Button>
          <Button variant="contained" onClick={() => navigate('/signup')} sx={{ m: 1 }}>
            Signup
          </Button>
        </>
      )}
    </Box>
  );
};

export default Home;