import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto' }}>
        <Typography variant="h5" sx={{ flexGrow: 1, color: '#007bff', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
          ZvertexAI
        </Typography>
        {!isAuthenticated ? (
          <>
            <Button sx={{ color: '#212529', mr: 2 }} onClick={() => navigate('/signup')}>Signup</Button>
            <Button sx={{ backgroundColor: '#007bff', color: '#fff' }} onClick={() => navigate('/login')}>Login</Button>
          </>
        ) : (
          <>
            <Button sx={{ color: '#212529', mr: 2 }} onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button sx={{ backgroundColor: '#dc3545', color: '#fff' }} onClick={handleLogout}>Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;