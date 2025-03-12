import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1E3A8A', contrastText: '#FFFFFF' }, // Deep Blue
    secondary: { main: '#14B8A6', contrastText: '#FFFFFF' }, // Teal
    background: { default: '#F9FAFB', paper: '#FFFFFF' }, // Light Gray / White
    text: { primary: '#111827', secondary: '#6B7280' }, // Dark Gray / Medium Gray
    error: { main: '#EF4444' }, // Red
    success: { main: '#10B981' }, // Green
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: { fontWeight: 700, color: '#111827' },
    h6: { fontWeight: 600, color: '#111827' },
    body1: { color: '#6B7280' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
  },
});

export default theme;