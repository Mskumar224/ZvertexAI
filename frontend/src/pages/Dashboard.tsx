import React, { useEffect, useState } from 'react';
import { Container, Typography, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const res = await axios.post('https://zvertexai-orzv.onrender.com/api/select-companies', {
          token,
          companies: JSON.parse(localStorage.getItem('selectedCompanies') || '[]'),
        });
        const appliedTodayRes = await axios.post('https://zvertexai-orzv.onrender.com/api/auto-apply', { token });
        setUserData({
          email: decoded.email,
          subscription: decoded.subscription,
          companies: JSON.parse(localStorage.getItem('selectedCompanies') || '[]'),
          appliedToday: appliedTodayRes.data.appliedToday || 0,
        });
      } catch (error) {
        console.error('Fetch user data failed:', error);
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate]);

  return (
    <Container className="glass-card" sx={{ mt: 5, py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>Dashboard</Typography>
      {userData ? (
        <>
          <Typography sx={{ mb: 1 }}>Email: {userData.email}</Typography>
          <Typography sx={{ mb: 1 }}>Subscription: {userData.subscription}</Typography>
          <Typography sx={{ mb: 1 }}>Selected Companies: {userData.companies.join(', ')}</Typography>
          <Typography sx={{ mb: 2 }}>Jobs Applied Today: {userData.appliedToday}</Typography>
          <Button variant="contained" onClick={() => navigate('/resume-upload')} sx={{ mr: 2, px: 4, py: 1.5 }}>
            Update Resume
          </Button>
          <Button variant="contained" onClick={() => navigate('/companies')} sx={{ mr: 2, px: 4, py: 1.5 }}>
            Update Companies
          </Button>
        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, px: 4, py: 1.5, borderColor: '#007bff', color: '#007bff' }}>Back</Button>
    </Container>
  );
};

export default Dashboard;