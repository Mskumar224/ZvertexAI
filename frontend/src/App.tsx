import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemButton, ListItemText, Button, InputBase, IconButton, Paper } from '@mui/material';
import { darkTheme } from './theme';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import Companies from './pages/Companies';
import ConfirmAutoApply from './pages/ConfirmAutoApply';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const Sidebar: React.FC = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: 240,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: 240,
        boxSizing: 'border-box',
        backgroundColor: '#1e1e1e',
        color: '#fff',
      },
    }}
  >
    <Toolbar />
    <Box sx={{ overflow: 'auto' }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="New Thread" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/dashboard">
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Discover" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Spaces" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Library" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  </Drawer>
);

const SearchBar: React.FC = () => (
  <Paper
    component="form"
    sx={{
      p: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 600,
      backgroundColor: '#2d2d2d',
      borderRadius: 2,
      mb: 4,
    }}
  >
    <InputBase
      sx={{ ml: 1, flex: 1, color: '#fff' }}
      placeholder="What do you want to know?"
      inputProps={{ 'aria-label': 'search' }}
    />
    <IconButton type="button" sx={{ p: '10px', color: '#fff' }} aria-label="search">
      <SearchIcon />
    </IconButton>
    <IconButton sx={{ p: '10px', color: '#00b4d8' }} aria-label="auto">
      <AutoAwesomeIcon />
    </IconButton>
  </Paper>
);

const Footer: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#1e1e1e', color: '#fff' }}>
    <Box>
      <Button variant="contained" sx={{ backgroundColor: '#00b4d8', '&:hover': { backgroundColor: '#00a1c1' } }}>
        Sign Up
      </Button>
      <Button variant="outlined" sx={{ ml: 2, color: '#fff', borderColor: '#fff' }}>
        Log in
      </Button>
    </Box>
    <Box>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>Pro</Typography>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>Enterprise</Typography>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>API</Typography>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>Blog</Typography>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>Careers</Typography>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>Store</Typography>
      <Typography variant="body2" sx={{ display: 'inline', mr: 2 }}>Finance</Typography>
      <Typography variant="body2" sx={{ display: 'inline' }}>English</Typography>
    </Box>
  </Box>
);

const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#1e1e1e', minHeight: '100vh' }}>
          <Toolbar />
          <Typography variant="h3" align="center" sx={{ color: '#fff', mb: 4 }}>
            What do you want to know?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <SearchBar />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#00b4d8', mr: 2 }}>
              Join the waitlist to get early access to Comet
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              Introducing Comet, a new browser for agentic search
            </Typography>
          </Box>
          {/* Placeholder for suggested topics/results */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="outlined" sx={{ mr: 2, color: '#fff', borderColor: '#fff' }}>
              Aimee Lou Wood's Teeth
            </Button>
            <Button variant="outlined" sx={{ mr: 2, color: '#fff', borderColor: '#fff' }}>
              Research Shows How Aspirin Fights Cancer
            </Button>
            <Button variant="outlined" sx={{ mr: 2, color: '#fff', borderColor: '#fff' }}>
              GOOGL +3.38%
            </Button>
            <Button variant="outlined" sx={{ color: '#fff', borderColor: '#fff' }}>
              Dow +0.52%
            </Button>
          </Box>
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
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;