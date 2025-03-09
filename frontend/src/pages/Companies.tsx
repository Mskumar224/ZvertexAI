import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, TextField, Box, Paper, List, ListItem, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { selectCompanies, getUserData } from '../services/api';
import { CompanyResumeMap } from '../types';

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyResumeMap[]>([]);
  const [input, setInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [resumePaths, setResumePaths] = useState<string[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();

  const predefinedCompanies = [
    'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Tesla', 'Netflix', 'IBM', 'Oracle', 'Intel',
    'Cisco', 'Adobe', 'Salesforce', 'Nvidia', 'AMD', 'PayPal', 'Uber', 'Lyft', 'Airbnb', 'Spotify',
    'Dropbox', 'Slack', 'Zoom', 'LinkedIn', 'Twitter'
  ];

  useEffect(() => {
    const fetchResumePaths = async () => {
      try {
        const data = await getUserData(token);
        const allPaths = [
          ...(data.resumePaths || []),
          ...(data.selectedCompanies?.map((item: CompanyResumeMap) => item.resumePath) || []),
        ].filter(path => path && typeof path === 'string');
        setResumePaths([...new Set(allPaths)]);
      } catch (error) {
        console.error('Error fetching resume paths:', error);
        setResumePaths([]);
      }
    };
    fetchResumePaths();
  }, [token]);

  const handleAddManual = () => {
    if (input && !companies.some(c => c.company === input) && companies.length < 12 && selectedResume) {
      setCompanies([...companies, { company: input, resumePath: selectedResume }]);
      setInput('');
      setSelectedResume('');
    } else if (companies.length >= 12) {
      alert('Maximum 12 companies allowed');
    } else if (!selectedResume) {
      alert('Please select a resume');
    }
  };

  const handleAddDropdown = () => {
    if (selectedCompany && !companies.some(c => c.company === selectedCompany) && companies.length < 12 && selectedResume) {
      setCompanies([...companies, { company: selectedCompany, resumePath: selectedResume }]);
      setSelectedCompany('');
      setSelectedResume('');
    } else if (companies.length >= 12) {
      alert('Maximum 12 companies allowed');
    } else if (!selectedResume) {
      alert('Please select a resume');
    }
  };

  const handleSubmit = async () => {
    try {
      await selectCompanies(token, companies);
      navigate('/confirm-auto-apply');
    } catch (error: any) {
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>Select Companies</Typography>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        {resumePaths.length === 0 ? (
          <Typography variant="body1" color="error">
            Please upload a resume first.{' '}
            <Button variant="text" onClick={() => navigate('/resume-upload')}>Go to Upload</Button>
          </Typography>
        ) : (
          <>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Predefined Companies</InputLabel>
              <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} label="Predefined Companies">
                {predefinedCompanies.map((company) => (
                  <MenuItem key={company} value={company} disabled={companies.some(c => c.company === company)}>
                    {company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Select Resume</InputLabel>
              <Select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} label="Select Resume">
                {resumePaths.map((path) => (
                  <MenuItem key={path} value={path}>{path.split('/').pop()}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
              <Button variant="contained" onClick={handleAddDropdown} disabled={!selectedCompany || !selectedResume} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                Add from Dropdown
              </Button>
              <TextField
                label="Add Manually"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddManual()}
                variant="outlined"
              />
              <Button variant="contained" onClick={handleAddManual} disabled={!selectedResume} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                Add
              </Button>
            </Box>
            <Typography variant="h6">Selected ({companies.length}/12):</Typography>
            <List>
              {companies.map((item, i) => (
                <ListItem key={i}>{item.company} - {item.resumePath.split('/').pop()}</ListItem>
              ))}
            </List>
            <Button variant="contained" onClick={handleSubmit} disabled={!companies.length} sx={{ mt: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
              Confirm Selection
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Companies;