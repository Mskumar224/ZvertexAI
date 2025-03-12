import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="glass-card" sx={{ textAlign: 'center', mt: 5, py: 5 }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: '#007bff', mb: 2 }}>Welcome to ZvertexAI</Typography>
      <Typography variant="h5" sx={{ mb: 4 }}>Automate your job applications or hiring process with AI.</Typography>
      <Button variant="contained" onClick={() => navigate('/signup')} sx={{ mr: 2, px: 4, py: 1.5 }}>Get Started</Button>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ px: 4, py: 1.5, borderColor: '#007bff', color: '#007bff' }}>Back</Button>
    </Container>
  );
};

export default LandingPage;