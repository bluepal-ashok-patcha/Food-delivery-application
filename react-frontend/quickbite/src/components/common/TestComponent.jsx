import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestComponent = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        🍕 QuickBite
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Food Delivery App - Like Swiggy
      </Typography>
      <Button variant="contained" size="large">
        Get Started
      </Button>
    </Box>
  );
};

export default TestComponent;
