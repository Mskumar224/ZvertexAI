import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Paper, List, ListItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../services/api';

const Dashboard: React.FC = () => {
  const [selectedCompanies, setSelectedCompanies] = useState<{ company: string; resumePath: string }[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<{ jobId: string; company: string; resumePath: string; date: Date }[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const data = await getUserData(token);
          setSelectedCompanies(data.selectedCompanies);
          setAppliedJobs(data.appliedJobs);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchData();
  }, [token]);

  if (!token) {
    navigate('/login');
    return null;
  }

  const today = new Date().toDateString();
  const todaySubmissions = appliedJobs.filter(job => new Date(job.date).toDateString() === today);
  const submissionCounts = selectedCompanies.map(item => ({
    company: item.company,
    count: appliedJobs.filter(job => job.company === item.company).length,
    todayCount: todaySubmissions.filter(job => job.company === item.company).length,
  }));

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>Welcome to ZvertexAI</Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Automate your job applications with ease
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
        <Button variant="contained" onClick={() => navigate('/resume-upload')} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
          Upload Resume
        </Button>
        <Button variant="outlined" onClick={() => navigate('/companies')} sx={{ borderColor: 'primary.main', color: 'primary.main' }}>
          Select Companies
        </Button>
      </Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mt: 4 }}>
        <Typography variant="h6">Auto-Apply Tracking</Typography>
        {selectedCompanies.length > 0 ? (
          <List>
            {submissionCounts.map((item, i) => (
              <ListItem key={i}>
                {item.company} - Total: {item.count} | Today: {item.todayCount}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No companies selected yet. Start by adding some!</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;