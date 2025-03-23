import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/reset-password', { token, newPassword });
      alert('Password reset successful. Please log in.');
      navigate('/login');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="glass-card" sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Reset Password</Typography>
      <TextField label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleReset} disabled={loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default ResetPassword;