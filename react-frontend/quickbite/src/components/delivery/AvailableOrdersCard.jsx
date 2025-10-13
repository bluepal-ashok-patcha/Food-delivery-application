import React from 'react';
import { Card, CardContent, Box, Typography, Chip, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import { LocationOn, AttachMoney, CheckCircle } from '@mui/icons-material';

const AvailableOrdersCard = ({ order, onAcceptOrder, sx }) => {
  return (
    <Card sx={{ 
      height: '100%',
      background: '#fff',
      borderRadius: '3px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      ...sx,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }
    }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            Order #{order.id}
          </Typography>
          <Chip 
            label="Ready for Pickup" 
            variant="outlined"
            sx={{
              background: 'linear-gradient(45deg, #2196f3, #1976d2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '12px'
            }}
            size="small" 
          />
        </Box>
        
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LocationOn sx={{ fontSize: 18, color: '#666' }} />
            </ListItemIcon>
            <ListItemText 
              primary={order.restaurantName || 'Pickup Location'}
              secondary={order.restaurantAddress || 'Restaurant'}
              primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: '#333' }}
              secondaryTypographyProps={{ fontSize: '13px', color: '#666' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LocationOn sx={{ fontSize: 18, color: '#666' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Delivery Address"
              secondary={order.deliveryAddress}
              primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: '#333' }}
              secondaryTypographyProps={{ fontSize: '13px', color: '#666' }}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AttachMoney sx={{ fontSize: 18, color: '#666' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Delivery Fee"
              secondary={`$${order.deliveryFee}`}
              primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: '#333' }}
              secondaryTypographyProps={{ fontSize: '13px', color: '#666' }}
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<CheckCircle />}
            onClick={() => onAcceptOrder(order.orderId || order.id)}
            sx={{
              background: 'linear-gradient(45deg, #fc8019, #ff6b35)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '3px',
              py: 1.5,
              boxShadow: '0 4px 16px rgba(252, 128, 25, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e6730a, #e55a2b)',
                boxShadow: '0 6px 20px rgba(252, 128, 25, 0.4)'
              }
            }}
          >
            Accept Order
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AvailableOrdersCard;
