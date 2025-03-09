import React, { useState } from 'react';
import { Button, Container, Typography, TextField, Box, Paper, List, ListItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { uploadResume, updateResume } from '../services/api';

const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [resumePath, setResumePath] = useState('');
  const [subscriptionPrompt, setSubscriptionPrompt] = useState(false); // New state for subscription prompt
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file || !token) return alert('Please select a file and log in');
    try {
      const res = await uploadResume(file, token);
      if (res.subscriptionRequired) {
        setSubscriptionPrompt(true); // Show subscription prompt
      } else {
        setResumePath(res.path);
        setSuggestions(res.suggestions);
        setSubscriptionPrompt(false); // Reset prompt if successful
      }
    } catch (error: any) {
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateSuggestions = () => {
    if (prompt) {
      const newSuggestions = [`- ${prompt}: Add technical skills`, `- ${prompt}: Update experience`];
      setAiSuggestions(newSuggestions);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateResume(token, resumePath, prompt);
      alert('Resume updated. Please upload the updated version.');
      setFile(null);
      setPrompt('');
      setSuggestions([]);
      setAiSuggestions([]);
    } catch (error: any) {
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSkip = () => navigate('/companies');

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>Upload Your Resume</Typography>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: '20px' }} />
        <Button variant="contained" onClick={handleUpload} disabled={!file} sx={{ mb: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
          Upload
        </Button>
        {subscriptionPrompt && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="error">Resume limit reached (5).</Typography>
            <Typography>Please upgrade your subscription for more uploads.</Typography>
            <Button variant="contained" onClick={() => alert('Subscription upgrade not implemented yet')} sx={{ mt: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
              Upgrade Subscription
            </Button>
          </Box>
        )}
        {suggestions.length > 0 && !subscriptionPrompt && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Suggestions:</Typography>
            <List>
              {suggestions.map((s, i) => <ListItem key={i}>{s}</ListItem>)}
            </List>
            <TextField
              label="Enhance your resume (e.g., 'Technical Skills')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ my: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleGenerateSuggestions} disabled={!prompt} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                Generate Suggestions
              </Button>
              <Button variant="outlined" onClick={handleSkip} sx={{ borderColor: 'primary.main', color: 'primary.main' }}>
                Skip Update
              </Button>
            </Box>
            {aiSuggestions.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 2 }}>AI Suggestions:</Typography>
                <List>
                  {aiSuggestions.map((s, i) => <ListItem key={i}>{s}</ListItem>)}
                </List>
                <Button variant="contained" onClick={handleUpdate} sx={{ mt: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                  Confirm Update
                </Button>
              </>
            )}
          </Box>
        )}
        {resumePath && !suggestions.length && !subscriptionPrompt && (
          <Button variant="contained" onClick={() => navigate('/companies')} sx={{ mt: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
            Select Companies
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default ResumeUpload;