import React, { useState } from 'react';
import { Button, Typography, Box, TextField, CircularProgress, List, ListItem, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmAutoApply: React.FC = () => {
  const navigate = useNavigate();
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auto-apply', {
        token: localStorage.getItem('token'),
        linkedinProfile,
        coverLetter,
      });
      setJobs(Object.values(res.data.jobs).flat()); // Flatten the jobs object into an array
      // Do not navigate immediately to show jobs
    } catch (error: any) {
      alert(error.response?.data?.message || 'Auto-apply failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="glass-card" sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Confirm Auto-Apply</Typography>
      <Typography sx={{ mb: 2 }}>Add optional details and confirm to start auto-applying.</Typography>
      <TextField label="LinkedIn Profile URL" value={linkedinProfile} onChange={e => setLinkedinProfile(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Cover Letter" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} multiline rows={4} fullWidth sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleConfirm} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Confirm'}
      </Button>
      {jobs.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Real-Time Job Listings</Typography>
          <List>
            {jobs.map((job, index) => (
              <ListItem key={index}>
                <Link href={job.url} target="_blank" rel="noopener" sx={{ color: '#1976d2' }}>
                  {job.title} - {job.company}
                </Link>
              </ListItem>
            ))}
          </List>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
            Go to Dashboard
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ConfirmAutoApply;