import React from 'react';
import { Box, Typography } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

const AdminHeader = () => {
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: '#fc8019',
          mb: 1
        }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
          Manage your food delivery platform
        </Typography>
      </Box>
      <Box sx={{ 
        width: 64, 
        height: 64, 
        borderRadius: '50%', 
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          background: '#fc8019',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Restaurant sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminHeader;
