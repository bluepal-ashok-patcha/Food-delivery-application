import React from 'react';
import { 
  Card,
  CardContent,
  Grid,
  Stack,
  Box,
  Typography, 
  Chip, 
  Button,
  Avatar
} from '@mui/material';
import { 
  Navigation, 
  Phone, 
  CheckCircle, 
  PlayArrow, 
  Restaurant, 
  Person
} from '@mui/icons-material';

const MyOrdersTable = ({ orders = [], onCompleteOrder, onRowClick, onAcceptOrder }) => {
  // Debug: Log orders to see if items are present
  console.log('MyOrdersTable orders:', orders);
  const getStatusColor = (status) => {
    const colors = {
      'assigned': '#FC8019',
      'accepted': '#FC8019',
      'heading_to_pickup': '#FC8019',
      'arrived_at_pickup': '#FC8019',
      'picked_up': '#FC8019',
      'heading_to_delivery': '#FC8019',
      'arrived_at_delivery': '#FC8019',
      'delivered': '#4CAF50'
    };
    return colors[status] || '#666';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'assigned': 'Ready to Start',
      'accepted': 'Accepted',
      'heading_to_pickup': 'Heading to Pickup',
      'arrived_at_pickup': 'Arrived at Pickup',
      'picked_up': 'Picked Up',
      'heading_to_delivery': 'Out for Delivery',
      'arrived_at_delivery': 'Arrived at Delivery',
      'delivered': 'Delivered'
    };
    return labels[status] || status;
  };

  return (
    <Grid container spacing={2}>
      {(orders || []).map((order) => (
        <Grid item xs={12} md={6} lg={4} key={order.id}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: '3px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5, fontSize: '16px' }}>
                    Order #{order.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                    {(order.items && order.items.length) || 0} items • ₹{order.deliveryFee != null ? order.deliveryFee : 0}
                  </Typography>
                  {/* Debug: Show items data */}
                  {console.log('Order items in card:', order.items)}
                </Box>
                <Chip 
                  label={getStatusLabel(order.status)}
                  variant="outlined"
                  sx={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '11px',
                    height: '22px',
                    borderRadius: '3px'
                  }}
                  size="small"
                />
              </Box>

              {/* Order Items */}
              {console.log('Rendering order items for order', order.id, ':', order.items)}
              {order.items && order.items.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1, fontSize: '13px' }}>
                    Order Items:
                  </Typography>
                  <Stack spacing={0.5}>
                    {order.items.slice(0, 3).map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '11px', flex: 1 }}>
                          {item.quantity}x {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '11px', fontWeight: 500 }}>
                          ₹{item.price * item.quantity}
                        </Typography>
                      </Box>
                    ))}
                    {order.items.length > 3 && (
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '10px', fontStyle: 'italic' }}>
                        +{order.items.length - 3} more items
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Customer & Restaurant Info */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, background: '#FC8019', fontSize: '14px' }}>
                    <Person sx={{ fontSize: '16px' }} />
                  </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontSize: '13px' }}>
                    {order.customerName || `Customer #${order.customerId}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
                    {order.deliveryAddress || 'Delivery address not available'}
                  </Typography>
                </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, background: '#FC8019', fontSize: '14px' }}>
                    <Restaurant sx={{ fontSize: '16px' }} />
                  </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontSize: '13px' }}>
                    {order.restaurantName || `Restaurant #${order.restaurantId}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
                    {order.restaurantAddress || 'Pickup address not available'}
                  </Typography>
                </Box>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack spacing={1}>
                {/* Start Delivery button for assigned orders */}
                {order.status === 'assigned' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => onAcceptOrder && onAcceptOrder(order.id)}
                    sx={{
                      background: '#FC8019',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '3px',
                      py: 1,
                      fontSize: '14px',
                      '&:hover': {
                        background: '#E6730A'
                      }
                    }}
                  >
                    Start Delivery
                  </Button>
                )}
                
                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Navigation />}
                    onClick={() => onRowClick && onRowClick(order)}
                    sx={{
                      flex: 1,
                      borderColor: '#FC8019',
                      color: '#FC8019',
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: '3px',
                      fontSize: '12px',
                      '&:hover': {
                        borderColor: '#E6730A',
                        backgroundColor: '#FFF5F0'
                      }
                    }}
                  >
                    Details
                  </Button>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Phone />}
                    sx={{
                      flex: 1,
                      borderColor: '#FC8019',
                      color: '#FC8019',
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: '3px',
                      fontSize: '12px',
                      '&:hover': {
                        borderColor: '#E6730A',
                        backgroundColor: '#FFF5F0'
                      }
                    }}
                  >
                    Call
                  </Button>
                </Box>
                
                {/* Status progression buttons */}
                {order.status === 'heading_to_delivery' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => onCompleteOrder && onCompleteOrder(order.id, 'arrived_at_delivery')}
                    sx={{
                      background: '#FC8019',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '3px',
                      py: 1,
                      fontSize: '14px',
                      '&:hover': {
                        background: '#E6730A'
                      }
                    }}
                  >
                    Arrived at Delivery
                  </Button>
                )}
                
                {order.status === 'arrived_at_delivery' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => onCompleteOrder && onCompleteOrder(order.id, 'delivered')}
                    sx={{
                      background: '#4CAF50',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '3px',
                      py: 1,
                      fontSize: '14px',
                      '&:hover': {
                        background: '#45A049'
                      }
                    }}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MyOrdersTable;