import React, { useState } from 'react';
import { Button, TextField, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define the job type based on the backend response structure
interface Job {
  id: string;
  title: string;
  posted: string;
  requiresDocs: boolean;
  url: string;
}

interface JobsData {
  [company: string]: Job[];
}

const Companies: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [jobs, setJobs] = useState<JobsData | null>(null);

  const handleAddCompany = () => {
    if (input && companies.length < 10) {
      setCompanies([...companies, input]);
      setInput('');
    } else if (companies.length >= 10) {
      alert('Maximum 10 companies allowed.');
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post('https://zvertexai-orzv.onrender.com/api/select-companies', { token, companies });
      localStorage.setItem('selectedCompanies', JSON.stringify(companies));
      setJobs(response.data.jobs);
    } catch (err: any) {
      alert(`Failed to save companies: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleContinue = () => {
    navigate('/confirm-auto-apply');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Select Companies</Typography>
      <TextField
        label="Add Company"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        onKeyPress={(e) => e.key === 'Enter' && handleAddCompany()}
      />
      <Button onClick={handleAddCompany} sx={{ mb: 2 }}>Add</Button>
      <Typography>Selected Companies: {companies.join(', ') || 'None'}</Typography>
      <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, mb: 2 }}>Save</Button>

      {jobs && (
        <>
          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>Available Jobs</Typography>
          {Object.entries(jobs).map(([company, jobList]) => (
            <Box key={company} sx={{ mb: 2 }}>
              <Typography variant="h6">{company}</Typography>
              <List>
                {(jobList as Job[]).length > 0 ? (
                  (jobList as Job[]).map((job) => (
                    <ListItem key={job.id}>
                      <ListItemText 
                        primary={job.title} 
                        secondary={`Posted: ${new Date(job.posted).toLocaleDateString()} | URL: ${job.url}`} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem><ListItemText primary="No jobs found" /></ListItem>
                )}
              </List>
            </Box>
          ))}
          <Button onClick={handleContinue} variant="contained" sx={{ mt: 2 }}>Continue to Auto-Apply</Button>
        </>
      )}
    </Box>
  );
};

export default Companies;