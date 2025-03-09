import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import ThemeToggle from './components/ThemeToggle';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import Companies from './pages/Companies';
import ConfirmAutoApply from './pages/ConfirmAutoApply';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark');
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <AppBar position="fixed" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>ZvertexAI</Typography>
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </Toolbar>
        </AppBar>
        <Box sx={{ pt: 8 }}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume-upload" element={<ResumeUpload />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/confirm-auto-apply" element={<ConfirmAutoApply />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;