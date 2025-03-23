import React, { useState } from 'react';
import { Button, Typography, Box, Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const technologies = [
  'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Web Development',
  'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'Blockchain', 'Database Administration',
  'Network Engineering', 'Game Development', 'UI/UX Design', 'Embedded Systems', 'Robotics', 'Big Data',
  'Internet of Things (IoT)', 'Augmented Reality', 'Virtual Reality'
];

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const [technology, setTechnology] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('token', localStorage.getItem('token') || '');
    if (technology) formData.append('technology', technology);

    try {
      await axios.post('http://localhost:5000/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('resumeUploaded', 'true');
      navigate('/companies');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="glass-card" sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>Upload Resume</Typography>
      <Autocomplete
        options={technologies}
        value={technology}
        onChange={(e, newValue) => setTechnology(newValue)}
        renderInput={(params) => <TextField {...params} label="Technology" fullWidth sx={{ mb: 2 }} />}
        freeSolo
      />
      <input type="file" accept="*" onChange={handleUpload} disabled={loading} style={{ display: 'none' }} id="resume-upload" />
      <label htmlFor="resume-upload">
        <Button variant="contained" component="span" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Upload Document'}
        </Button>
      </label>
    </Box>
  );
};

export default ResumeUpload;