import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add, LocationOn } from '@mui/icons-material';

const EmptyAddresses = ({ onAdd }) => (
  <Box sx={{ textAlign: 'center', py: 3 }}>
    <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
    <Typography variant="h6" gutterBottom sx={{ fontSize: '16px' }}>No addresses added yet</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '14px' }}>
      Add your delivery addresses for faster checkout
    </Typography>
    <Button variant="contained" startIcon={<Add />} onClick={onAdd} size="small" sx={{ backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' }, fontSize: '13px', px: 2, py: 1, borderRadius: '6px' }}>
      Add Your First Address
    </Button>
  </Box>
);

export default EmptyAddresses;


