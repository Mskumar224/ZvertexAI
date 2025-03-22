import React, { useState } from 'react';
import { Button, Typography, Box, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const [manualTech, setManualTech] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleUpload = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('token', token);
        if (manualTech) formData.append('technology', manualTech);
        try {
          const response = await axios.post('https://zvertexai-orzv.onrender.com/api/upload-resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          localStorage.setItem('resumeUploaded', 'true');
          if (!response.data.technology) {
            setShowManualInput(true);
          } else {
            navigate('/companies');
          }
        } catch (err: any) {
          alert(`Upload failed: ${err.response?.data?.message || 'Unknown error'}`);
        }
      }
    };
    input.click();
  };

  const handleManualSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token || !manualTech) return;
    const formData = new FormData();
    formData.append('token', token);
    formData.append('technology', manualTech);
    try {
      await axios.post('https://zvertexai-orzv.onrender.com/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/companies');
    } catch (err: any) {
      alert(`Failed to save technology: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Upload Resume</Typography>
      {!showManualInput ? (
        <Button onClick={handleUpload} variant="contained">Upload Resume (PDF)</Button>
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>No technologies detected in your resume. Please enter them manually:</Typography>
          <TextField
            label="Technologies (e.g., JavaScript, Python)"
            value={manualTech}
            onChange={(e) => setManualTech(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button onClick={handleManualSubmit} variant="contained">Save and Continue</Button>
        </>
      )}
    </Box>
  );
};

export default ResumeUpload;