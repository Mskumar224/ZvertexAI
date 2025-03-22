import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import StaticHomePage from './components/StaticHomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResumeUpload from './pages/ResumeUpload';
import Companies from './pages/Companies';
import ConfirmAutoApply from './pages/ConfirmAutoApply';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', cursor: 'pointer' }}
            >
              ZvertexAI
            </Typography>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<StaticHomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/confirm-auto-apply" element={<ConfirmAutoApply />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<Login />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;