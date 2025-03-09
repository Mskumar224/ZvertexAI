import React from 'react';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, toggleDarkMode }) => (
  <IconButton onClick={toggleDarkMode} color="inherit">
    {darkMode ? <Brightness7 /> : <Brightness4 />}
  </IconButton>
);

export default ThemeToggle;