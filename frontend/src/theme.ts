import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00b4d8' },
    background: { default: '#1e1e1e', paper: '#2d2d2d' },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h3: { fontSize: '2rem', fontWeight: 700, color: '#fff' },
    body2: { color: '#fff' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, textTransform: 'none', padding: '8px 16px' },
        outlined: { borderColor: '#fff' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: '#2d2d2d' },
      },
    },
  },
});

export { darkTheme };