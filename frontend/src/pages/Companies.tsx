import React, { useState } from 'react';
import { Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const companyList = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Tesla', 'Netflix', 'IBM', 'Oracle', 'Intel',
  'Cisco', 'Adobe', 'Salesforce', 'SAP', 'NVIDIA', 'AMD', 'Qualcomm', 'Twitter', 'LinkedIn', 'Uber',
  'Lyft', 'Airbnb', 'Spotify', 'Dropbox', 'Slack', 'Zoom', 'PayPal', 'Square', 'Stripe', 'Shopify',
  'Ebay', 'Etsy', 'Pinterest', 'Reddit', 'Snapchat', 'TikTok', 'Disney', 'Warner Bros', 'Sony', 'Fox',
  'Boeing', 'Lockheed Martin', 'Northrop Grumman', 'Raytheon', 'General Electric', 'Honeywell', '3M',
  'Caterpillar', 'John Deere', 'Ford', 'General Motors', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz',
  'Volkswagen', 'Audi', 'Porsche', 'Ferrari', 'McLaren', 'SpaceX', 'Blue Origin', 'Virgin Galactic',
  'NASA', 'JPMorgan Chase', 'Goldman Sachs', 'Morgan Stanley', 'Bank of America', 'Wells Fargo',
  'Citigroup', 'Barclays', 'HSBC', 'Deutsche Bank', 'UBS', 'Deloitte', 'PwC', 'EY', 'KPMG', 'Accenture',
  'McKinsey', 'BCG', 'Bain & Company', 'Walmart', 'Target', 'Costco', 'Home Depot', 'Lowes', 'Best Buy',
  'Nike', 'Adidas', 'Under Armour', 'PepsiCo', 'Coca-Cola', 'Nestle', 'Unilever', 'Procter & Gamble',
  'Johnson & Johnson', 'Pfizer', 'Moderna', 'AstraZeneca'
];

const Companies: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/select-companies', {
        token: localStorage.getItem('token'),
        companies,
      });
      localStorage.setItem('selectedCompanies', JSON.stringify(companies));
      navigate('/confirm-auto-apply');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save companies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="glass-card" sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Select Companies</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Companies</InputLabel>
        <Select
          multiple
          value={companies}
          onChange={(e) => setCompanies(e.target.value as string[])}
          renderValue={(selected) => (selected as string[]).join(', ')}
        >
          {companyList.map((company) => (
            <MenuItem key={company} value={company}>
              {company}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography sx={{ mb: 2 }}>Selected: {companies.join(', ') || 'None'}</Typography>
      <Button variant="contained" onClick={handleSubmit} disabled={loading || !companies.length}>
        {loading ? <CircularProgress size={24} /> : 'Save & Continue'}
      </Button>
    </Box>
  );
};

export default Companies;