import React from 'react';
import { Box, Button, Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

const FloatingCartButton = ({ totalItems, onClick, label = 'View Cart' }) => (
  totalItems > 0 ? (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Button variant="contained" startIcon={<ShoppingCart />} onClick={onClick} sx={{ borderRadius: '3px', px: 3, py: 1.5, backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a', transform: 'translateY(-1px)' }, boxShadow: '0 4px 12px rgba(252, 128, 25, 0.3)', fontWeight: 600, fontSize: '14px', textTransform: 'none', transition: 'all 0.2s ease' }}>
        <Badge badgeContent={totalItems} color="error" sx={{ mr: 1, '& .MuiBadge-badge': { backgroundColor: '#ff4444', color: 'white', fontWeight: 600, fontSize: '10px' } }}>
          {label}
        </Badge>
      </Button>
    </Box>
  ) : null
);

export default FloatingCartButton;


