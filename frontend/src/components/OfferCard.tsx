import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface OfferCardProps {
  title: string;
  price: string;
  features: string[];
}

const OfferCard: React.FC<OfferCardProps> = ({ title, price, features }) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ maxWidth: 300, m: 2, bgcolor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h5" color="primary">{title}</Typography>
        <Typography variant="h6">{price}</Typography>
        {features.map((feature, index) => (
          <Typography key={index} variant="body2">{feature}</Typography>
        ))}
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/signup')}>Choose Plan</Button>
      </CardContent>
    </Card>
  );
};

export default OfferCard;