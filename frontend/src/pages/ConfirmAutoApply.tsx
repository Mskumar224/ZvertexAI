import React, { useState } from 'react';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { confirmAutoApply, autoApply } from '../services/api';

const ConfirmAutoApply: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      const response = await confirmAutoApply(token);
      setJobs(Object.values(response.jobs).flat());
    } catch (error: any) {
      alert(`Confirmation failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAutoApply = async () => {
    try {
      await autoApply(token);
      navigate('/dashboard');
    } catch (error: any) {
      alert(`Auto-apply failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>Confirm Auto-Apply</Typography>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        {jobs.length === 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>Ready to apply?</Typography>
            <Button variant="contained" onClick={handleConfirm} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
              Preview Jobs
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h6">Jobs to Apply:</Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', my: 2 }}>
              {jobs.map((job) => (
                <Typography key={job.id}>{job.title} - {job.company} ({job.location})</Typography>
              ))}
            </Box>
            <Button variant="contained" onClick={handleAutoApply} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
              Start Auto-Apply
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ConfirmAutoApply;