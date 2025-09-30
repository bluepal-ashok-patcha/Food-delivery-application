import React from 'react';
import { Box, Typography, Switch, Button, IconButton, Menu, MenuItem, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Restaurant } from '@mui/icons-material';

const RestaurantHeader = ({ isOpen, onToggleStatus, onEditProfile, onOpenRecentOrders }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h3" sx={{ 
          fontWeight: 800, 
          color: '#fc8019',
          mb: 1
        }}>
          Restaurant Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
          Manage your restaurant operations
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
            <Restaurant sx={{ color: '#fff', fontSize: 28 }} />
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
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); onOpenRecentOrders && onOpenRecentOrders(); }}>
              <ListItemText primary="View Recent Orders" />
            </MenuItem>
          </Menu>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Restaurant Status:
          </Typography>
          <Switch
            checked={isOpen}
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
          <Typography variant="body1" color={isOpen ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
            {isOpen ? 'Open' : 'Closed'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RestaurantHeader;