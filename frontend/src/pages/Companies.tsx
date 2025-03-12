import React, { useState } from 'react';
import { Container, Typography, Select, Button, MenuItem, FormControl, InputLabel, TextField, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const predefinedCompanies = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Tesla', 'Netflix', 'IBM', 'Intel', 'Cisco',
  'Adobe', 'Salesforce', 'Oracle', 'SAP', 'NVIDIA', 'Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG',
  'Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'Uber', 'Airbnb'
];

const Companies: React.FC = () => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [manualCompany, setManualCompany] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5002/api/select-companies', {
        token: localStorage.getItem('token'),
        companies: selectedCompanies,
      });
      localStorage.setItem('selectedCompanies', JSON.stringify(selectedCompanies));
      navigate('/confirm-auto-apply');
    } catch (error: any) {
      alert('Failed to select companies: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];
    if (value.length <= 10) setSelectedCompanies(value);
  };

  const handleManualAdd = () => {
    if (manualCompany && !selectedCompanies.includes(manualCompany) && selectedCompanies.length < 10) {
      setSelectedCompanies([...selectedCompanies, manualCompany]);
      setManualCompany('');
    }
  };

  return (
    <Container className="glass-card" sx={{ mt: 5, py: 5 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 500 }}>Select Companies (Up to 10)</Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="companies-label">Companies</InputLabel>
          <Select labelId="companies-label" multiple value={selectedCompanies} onChange={handleChange} label="Companies">
            {predefinedCompanies.map((company) => (
              <MenuItem key={company} value={company} disabled={selectedCompanies.length >= 10 && !selectedCompanies.includes(company)}>
                {company}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="textSecondary">Selected: {selectedCompanies.length}/10</Typography>
        </FormControl>
        <TextField
          label="Add Company Manually"
          value={manualCompany}
          onChange={(e) => setManualCompany(e.target.value)}
          fullWidth
          margin="normal"
          disabled={selectedCompanies.length >= 10}
        />
        <Button variant="outlined" onClick={handleManualAdd} disabled={!manualCompany || selectedCompanies.length >= 10} sx={{ mt: 1, mb: 2 }}>
          Add
        </Button>
        <Button type="submit" variant="contained" sx={{ mr: 2, px: 4, py: 1.5 }}>Next</Button>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ px: 4, py: 1.5, borderColor: '#007bff', color: '#007bff' }}>Back</Button>
      </form>
      <Typography sx={{ mt: 2 }}>Selected Companies: {selectedCompanies.join(', ')}</Typography>
    </Container>
  );
};

export default Companies;