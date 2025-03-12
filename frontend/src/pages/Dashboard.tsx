import React, { useEffect, useState } from 'react';
import { Container, Typography, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string>('');
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
        const companies = JSON.parse(localStorage.getItem('selectedCompanies') || '[]');
        const res = await axios.post('https://zvertexai-orzv.onrender.com/api/select-companies', {
          token,
          companies,
        });

        // Only call auto-apply if prerequisites are met
        if (companies.length > 0 && localStorage.getItem('resumeUploaded') === 'true') {
          const appliedTodayRes = await axios.post('https://zvertexai-orzv.onrender.com/api/auto-apply', { token });
          setUserData({
            email: decoded.email,
            subscription: decoded.subscription,
            companies: companies,
            appliedToday: appliedTodayRes.data.appliedToday || 0,
          });
        } else {
          setUserData({
            email: decoded.email,
            subscription: decoded.subscription,
            companies: companies,
            appliedToday: 0,
          });
          setError('Please upload a resume and select companies to start auto-applying.');
        }
      } catch (error: any) {
        console.error('Fetch user data failed:', error);
        if (error.response?.status === 400) {
          setError(error.response.data.message || 'Setup incomplete. Please upload a resume and select companies.');
          navigate('/resume-upload');
        } else {
          setError('Failed to load user data. Please try again.');
          navigate('/login');
        }
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
      {error && <Typography sx={{ mt: 2, color: '#dc3545' }}>{error}</Typography>}
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2, px: 4, py: 1.5, borderColor: '#007bff', color: '#007bff' }}>Back</Button>
    </Container>
  );
};

export default Dashboard;