import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const CartHeader = ({ title = 'Your Cart', onBack }) => (
  <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', py: 1.5 }}>
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton onClick={onBack} sx={{ color: '#333', p: 0.5 }}>
          <ArrowBack sx={{ fontSize: '20px' }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>{title}</Typography>
      </Box>
    </Container>
  </Box>
);

export default CartHeader;


