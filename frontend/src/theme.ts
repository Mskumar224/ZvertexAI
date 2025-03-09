import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', textTransform: 'none', padding: '10px 20px' },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#a5b4fc' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
  typography: lightTheme.typography,
  components: lightTheme.components,
});

export { lightTheme, darkTheme };