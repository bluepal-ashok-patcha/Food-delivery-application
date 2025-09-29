import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { Receipt } from '@mui/icons-material';

const EmptyOrdersCard = () => (
  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '8px' }}>
    <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
    <Typography variant="h6" gutterBottom sx={{ fontSize: '18px' }}>No orders yet</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '14px' }}>
      Start ordering delicious food from your favorite restaurants!
    </Typography>
    <Button 
      variant="contained" 
      onClick={() => window.location.href = '/'}
      sx={{ backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' }, px: 3, py: 1, fontSize: '14px', fontWeight: 600, borderRadius: '6px' }}
    >
      Browse Restaurants
    </Button>
  </Paper>
);

export default EmptyOrdersCard;


