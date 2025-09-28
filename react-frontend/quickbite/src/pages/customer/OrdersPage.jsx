import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Chip, 
  Button,
  Grid,
  Divider
} from '@mui/material';
import RatingModal from '../../components/modals/RatingModal';
import { 
  Restaurant, 
  AccessTime, 
  LocalShipping, 
  Star,
  Receipt,
  ArrowForward,
} from '@mui/icons-material';
import { fetchOrders } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: orders, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.id));
    }
  }, [dispatch, user]);

  const handleOpenRatingModal = (order) => {
    setSelectedOrder(order);
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setSelectedOrder(null);
    setRatingModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'info';
      case 'preparing': return 'warning';
      case 'out_for_delivery': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'placed': return 'Order Placed';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading orders..." />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '20px' }}>
        Your Orders
      </Typography>
      
      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '8px' }}>
          <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="h6" gutterBottom sx={{ fontSize: '18px' }}>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '14px' }}>
            Start ordering delicious food from your favorite restaurants!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/'}
            sx={{ 
              backgroundColor: '#fc8019',
              '&:hover': { backgroundColor: '#e6730a' },
              px: 3,
              py: 1,
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '6px'
            }}
          >
            Browse Restaurants
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
                    Order #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                    {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Chip 
                  label={getStatusText(order.status)} 
                  color={getStatusColor(order.status)}
                  size="small"
                  sx={{ fontSize: '11px', height: '24px' }}
                />
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Restaurant sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      Restaurant
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px', mb: 1 }}>
                    {order.restaurantName || 'Restaurant Name'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <LocalShipping sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      Delivery Address
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '13px' }}>
                    {order.deliveryAddress}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Receipt sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      Order Items
                    </Typography>
                  </Box>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ fontSize: '13px' }}>
                      {item.quantity}x {item.name}
                    </Typography>
                  ))}
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, fontSize: '16px', color: '#fc8019' }}>
                    Total: ${order.total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {order.status === 'delivered' ? (
                  <Button variant="outlined" size="small" onClick={() => handleOpenRatingModal(order)}>
                    Rate Order
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    Track Order
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
      <RatingModal
        open={ratingModalOpen}
        onClose={handleCloseRatingModal}
        order={selectedOrder}
      />
    </Container>
  );
};

export default OrdersPage;
