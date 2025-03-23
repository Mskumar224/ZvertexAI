import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, TextField, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaticHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');

        const companies = JSON.parse(localStorage.getItem('selectedCompanies') || '[]');
        const res = await axios.post('http://localhost:5000/api/select-companies', { token, companies });
        setUserData({
          email: decoded.email,
          companies,
          appliedToday: res.data.appliedToday || 0,
        });
      } catch (error: any) {
        setError(error.message === 'Token expired' ? 'Session expired. Please log in.' : 'Failed to load data.');
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchUserData();
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    setError('');
    navigate('/');
  };

  return (
    <Box className="twitter-layout" sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <Box className="left-sidebar glass-card" sx={{ width: '25%', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#1976d2' }}>AutoJobApply</Typography>
        <Button variant="contained" onClick={() => navigate('/login')} disabled={isAuthenticated} sx={{ mb: 2, width: '100%' }}>Login</Button>
        <Button variant="contained" onClick={() => navigate('/signup')} disabled={isAuthenticated} sx={{ mb: 2, width: '100%' }}>Signup</Button>
        {isAuthenticated && (
          <>
            <Button variant="outlined" onClick={() => navigate('/resume-upload')} sx={{ mb: 2, width: '100%' }}>Upload Resume</Button>
            <Button variant="outlined" onClick={() => navigate('/companies')} sx={{ mb: 2, width: '100%' }}>Select Companies</Button>
            <Button variant="outlined" onClick={() => navigate('/confirm-auto-apply')} sx={{ mb: 2, width: '100%' }}>Auto Apply</Button>
            <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ mb: 2, width: '100%' }}>Dashboard</Button>
            <Button variant="contained" color="error" onClick={handleLogout} sx={{ mb: 2, width: '100%' }}>Logout</Button>
          </>
        )}
      </Box>
      <Box className="middle-content" sx={{ flex: 1, p: 4 }}>
        <Box className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
          {!isAuthenticated ? (
            <>
              <Typography variant="h3" sx={{ mb: 3, color: '#1976d2' }}>Welcome to AutoJobApply</Typography>
              <Typography variant="h6" sx={{ mb: 3 }}>Automate your job applications with ease.</Typography>
              <Button variant="contained" onClick={() => navigate('/signup')} sx={{ mb: 3, px: 4, py: 1.5 }}>Get Started</Button>
              <Typography variant="h5" sx={{ mb: 2 }}>Plans</Typography>
              {[
                { title: 'Student', price: '$39/month', desc: '1 resume, 45 applies/day' },
                { title: 'Vendor/Recruiter', price: '$79/month', desc: '5 resumes, 35 applies/day' },
                { title: 'Business', price: '$149/month', desc: '10 resumes, 35 applies/day' },
              ].map((plan, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Button variant="outlined" onClick={() => navigate('/signup')} sx={{ width: '100%', py: 1.5 }}>{`${plan.title}: ${plan.price} (${plan.desc})`}</Button>
                </Box>
              ))}
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Your Job Hunt</Typography>
              {loading ? <CircularProgress /> : userData ? (
                <>
                  <Typography sx={{ mb: 2 }}>Email: {userData.email}</Typography>
                  <Typography sx={{ mb: 2 }}>Companies: {userData.companies.join(', ') || 'None'}</Typography>
                  <Typography sx={{ mb: 2 }}>Jobs Applied Today: {userData.appliedToday || 0}</Typography>
                  <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ px: 4, py: 1.5 }}>View Dashboard</Button>
                </>
              ) : (
                <Typography>No data available. Please complete setup.</Typography>
              )}
              {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            </>
          )}
        </Box>
      </Box>
      <Box className="right-sidebar glass-card" sx={{ width: '25%', p: 3 }}>
        {!isAuthenticated ? (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Quick Login</Typography>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <Button variant="contained" onClick={handleLogin} disabled={loading} sx={{ mb: 2, width: '100%' }}>
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/forgot-password')}>Forgot Password?</Button>
          </>
        ) : (
          <Typography variant="h6" sx={{ color: '#1976d2' }}>Welcome Back!</Typography>
        )}
      </Box>
    </Box>
  );
};

export default StaticHomePage;