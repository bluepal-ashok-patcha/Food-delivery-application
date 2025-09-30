import React from 'react';
import { Box, Typography, Switch, Button } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';

const DeliveryHeader = ({ isOnline, onToggleStatus, onEditProfile }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: '#fc8019',
          mb: 1
        }}>
          Delivery Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
          Manage your delivery operations
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <LocalShipping sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onEditProfile && (
            <Button
              variant="contained"
              onClick={onEditProfile}
              sx={{
                background: '#fc8019',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '4px',
                px: 2.5,
                '&:hover': { background: '#e6730a' }
              }}
            >
              Edit Profile
            </Button>
          )}
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Status:
          </Typography>
          <Switch
            checked={isOnline}
            onChange={onToggleStatus}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#fc8019',
                '& + .MuiSwitch-track': {
                  backgroundColor: '#fc8019',
                },
              },
            }}
          />
          <Typography variant="body1" color={isOnline ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
            {isOnline ? 'Online' : 'Offline'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DeliveryHeader;
