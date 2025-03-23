import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
        const res = await axios.post('http://localhost:5000/api/user-data', { token });
        setUserData({
          email: decoded.email,
          companies: JSON.parse(localStorage.getItem('selectedCompanies') || '[]'),
          totalJobsApplied: res.data.totalJobsApplied || 0,
        });
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to load dashboard');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <Box className="glass-card" sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Dashboard</Typography>
      {loading ? <CircularProgress /> : userData ? (
        <>
          <Typography sx={{ mb: 2 }}>Email: {userData.email}</Typography>
          <Typography sx={{ mb: 2 }}>Selected Companies: {userData.companies.join(', ') || 'None'}</Typography>
          <Typography sx={{ mb: 2 }}>Total Jobs Applied: {userData.totalJobsApplied}</Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Home</Button>
        </>
      ) : (
        <Typography>Error loading data</Typography>
      )}
    </Box>
  );
};

export default Dashboard;