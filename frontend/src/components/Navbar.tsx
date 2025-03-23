import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Button color="inherit" onClick={() => navigate('/')}>
          <Typography variant="h6" component="div">
            AutoJobApply
          </Typography>
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;