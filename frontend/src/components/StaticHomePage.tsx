import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaticHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No session found. Please log in.');
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          throw new Error('Token expired');
        }

        const companies = JSON.parse(localStorage.getItem('selectedCompanies') || '[]');
        const res = await axios.post('https://zvertexai-orzv.onrender.com/api/select-companies', {
          token,
          companies,
        });

        const userRes = await axios.get('https://zvertexai-orzv.onrender.com/api/health');
        if (companies.length > 0 && localStorage.getItem('resumeUploaded') === 'true') {
          const appliedToday = await axios.post('https://zvertexai-orzv.onrender.com/api/auto-apply', { token });
          setUserData({
            email: decoded.email,
            companies: companies,
            appliedToday: appliedToday.data.appliedToday || 0,
          });
        } else {
          setUserData({
            email: decoded.email,
            companies: companies,
            appliedToday: 0,
          });
          setError('Please upload a resume and select companies to start auto-applying.');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        const errorStatus = error.response?.status || 'No status';
        console.error('Fetch user data failed:', { status: errorStatus, message: errorMessage, fullError: error });

        if (errorMessage === 'Token expired' || errorStatus === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('resumeUploaded');
          localStorage.removeItem('selectedCompanies');
          navigate('/login');
        } else if (errorStatus === 500) {
          setError('Server error occurred. Please try again later.');
        } else if (errorStatus === 400) {
          setError(errorMessage || 'Setup incomplete. Please upload a resume and select companies.');
          navigate('/resume-upload');
        } else {
          setError(`Network or unexpected error: ${errorMessage}`);
        }
      }
    };
    if (isAuthenticated) fetchUserData();
  }, [isAuthenticated, navigate]);

  const handleUpload = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '/';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('token', token);
        try {
          await axios.post('https://zvertexai-orzv.onrender.com/api/upload-resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          localStorage.setItem('resumeUploaded', 'true');
          navigate('/companies');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
          const errorStatus = error.response?.status || 'No status';
          if (errorStatus === 401) {
            setError('Session expired during upload. Please log in again.');
            localStorage.removeItem('token');
            navigate('/login');
          } else {
            alert(`Upload failed: ${errorMessage}`);
          }
        }
      }
    };
    input.click();
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://zvertexai-orzv.onrender.com/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Login failed: ${errorMessage}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('resumeUploaded');
    localStorage.removeItem('selectedCompanies');
    setUserData(null);
    setError('');
    navigate('/');
  };

  const handlePlanClick = () => {
    if (!isAuthenticated) navigate('/signup');
  };

  return (
    <Box className="twitter-layout" sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box className="left-sidebar glass-card" sx={{ width: '20%', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>ZvertexAI</Typography>
        {/* Always show Login and Signup, adjust disabled state */}
        <Button
          onClick={() => navigate('/login')}
          disabled={isAuthenticated}
          sx={{ mb: 1, width: '100%', bgcolor: isAuthenticated ? 'grey.300' : 'primary.main', color: isAuthenticated ? 'grey.600' : 'white' }}
        >
          Login
        </Button>
        <Button
          onClick={() => navigate('/signup')}
          disabled={!isAuthenticated}
          sx={{ mb: 1, width: '100%', bgcolor: !isAuthenticated ? 'grey.300' : 'primary.main', color: !isAuthenticated ? 'grey.600' : 'white' }}
        >
          Signup
        </Button>
        {isAuthenticated && (
          <>
            <Button onClick={() => navigate('/resume-upload')} sx={{ mb: 1, width: '100%' }}>Update Resume</Button>
            <Button onClick={() => navigate('/companies')} sx={{ mb: 1, width: '100%' }}>Update Companies</Button>
            <Button onClick={() => navigate('/confirm-auto-apply')} sx={{ mb: 1, width: '100%' }}>Auto Apply</Button>
            <Button onClick={() => alert('Connect to LinkedIn - Coming Soon')} sx={{ mb: 1, width: '100%' }}>Connect to LinkedIn</Button>
            <Button onClick={() => alert('Latest Trending Jobs - Coming Soon')} sx={{ mb: 1, width: '100%' }}>Latest Trending Jobs</Button>
            <Button onClick={handleLogout} sx={{ mb: 1, width: '100%', bgcolor: 'error.main', color: 'white' }}>Logout</Button>
          </>
        )}
      </Box>
      <Box className="middle-content" sx={{ flex: 1, p: 3 }}>
        <Box className="glass-card" sx={{ textAlign: 'center', p: 4 }}>
          {!isAuthenticated ? (
            <>
              <Button onClick={() => navigate('/signup')} sx={{ fontSize: '18px', py: 2, px: 4, mb: 3 }}>Get Started</Button>
              <Typography variant="h5" sx={{ mb: 3 }}>Subscription Plans</Typography>
              {[
                { title: 'Student', price: '$39/month', desc: '1 resume, 45 job auto-applies/day' },
                { title: 'Vendor/Recruiter', price: '$79/month', desc: '5 resumes, 35 auto-applies/day' },
                { title: 'Business', price: '$149/month', desc: '2 recruiters, 10 resumes, 35 auto-applies/day' },
              ].map((plan, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <Button onClick={handlePlanClick} sx={{ width: '100%', py: 1.5 }}>{`${plan.title}: ${plan.price} (${plan.desc})`}</Button>
                </Box>
              ))}
            </>
          ) : (
            <>
              <Button onClick={handleUpload} sx={{ fontSize: '18px', py: 2, px: 4, mb: 3 }}>Upload Resume</Button>
              <Typography variant="h5" sx={{ mb: 3 }}>Your Job Application Status</Typography>
              {userData ? (
                <>
                  <Typography sx={{ mb: 2 }}>Selected Companies: {userData.companies.join(', ') || 'None'}</Typography>
                  <Typography sx={{ mb: 2 }}>Jobs Applied Today: {userData.appliedToday}</Typography>
                  <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ px: 4, py: 1.5 }}>View Dashboard</Button>
                </>
              ) : (
                <Typography>Loading your data...</Typography>
              )}
              {error && <Typography sx={{ mt: 2, color: '#dc3545' }}>{error}</Typography>}
            </>
          )}
        </Box>
      </Box>
      <Box className="right-sidebar glass-card" sx={{ width: '20%', p: 2 }}>
        {!isAuthenticated ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>New to ZvertexAI? Log In</Typography>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button onClick={handleLogin} sx={{ mb: 2, width: '100%', bgcolor: 'primary.main', color: 'white' }}>
              Log In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              sx={{ width: '100%', bgcolor: '#28a745', color: '#fff' }}
            >
              Sign Up
            </Button>
          </>
        ) : (
          userData ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Welcome Back!</Typography>
              <Typography>Email: {userData.email}</Typography>
              <Typography>Companies: {userData.companies.join(', ') || 'None'}</Typography>
              <Typography>Jobs Today: {userData.appliedToday}</Typography>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )
        )}
      </Box>
    </Box>
  );
};

export default StaticHomePage;