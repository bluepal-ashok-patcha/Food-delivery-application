import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, Grid, Divider, Button, TextField } from '@mui/material';
import { Restaurant, LocalShipping, Receipt, Star } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { submitRestaurantReview, submitPartnerReview } from '../../store/slices/reviewsSlice';
import { showNotification } from '../../store/slices/uiSlice';

const statusColor = (status) => {
  switch (status) {
    case 'placed': return 'info';
    case 'preparing': return 'warning';
    case 'out_for_delivery': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const statusText = (status) => {
  switch (status) {
    case 'placed': return 'Order Placed';
    case 'preparing': return 'Preparing';
    case 'out_for_delivery': return 'Out for Delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const OrderCard = ({ order }) => {
  const dispatch = useDispatch();
  const [restRating, setRestRating] = useState(5);
  const [partnerRating, setPartnerRating] = useState(5);

  const submitRest = async () => {
    await dispatch(submitRestaurantReview({ restaurantId: order.restaurantId || 1, rating: restRating, userName: 'You' }));
    dispatch(showNotification({ message: 'Thanks for rating the restaurant!', type: 'success' }));
  };

  const submitPartner = async () => {
    const partnerId = order.deliveryPartnerId || 4;
    await dispatch(submitPartnerReview({ partnerId, rating: partnerRating, userName: 'You' }));
    dispatch(showNotification({ message: 'Thanks for rating the delivery partner!', type: 'success' }));
  };

  return (
  <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>Order #{order.id}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
          {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
        </Typography>
      </Box>
      <Chip label={statusText(order.status)} color={statusColor(order.status)} size="small" sx={{ fontSize: '11px', height: '24px' }} />
    </Box>
    <Divider sx={{ my: 1.5 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Restaurant sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>Restaurant</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px', mb: 1 }}>{order.restaurantName || 'Restaurant Name'}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <LocalShipping sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>Delivery Address</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontSize: '13px' }}>{order.deliveryAddress}</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Receipt sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>Order Items</Typography>
        </Box>
        {order.items.map((item, index) => (
          <Typography key={index} variant="body2" sx={{ fontSize: '13px' }}>{item.quantity}x {item.name}</Typography>
        ))}
        <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, fontSize: '16px', color: '#fc8019' }}>
          Total: ${order.total.toFixed(2)}
        </Typography>
      </Grid>
    </Grid>
    {order.status === 'delivered' && (
      <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '12px' }}>Rate your experience</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Restaurant</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} onClick={() => setRestRating(s)} sx={{ fontSize: 18, color: s <= restRating ? '#ffc107' : '#e0e0e0', cursor: 'pointer' }} />
              ))}
            </Box>
            <Button variant="contained" size="small" onClick={submitRest} sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' } }}>Submit</Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Delivery Partner</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} onClick={() => setPartnerRating(s)} sx={{ fontSize: 18, color: s <= partnerRating ? '#ffc107' : '#e0e0e0', cursor: 'pointer' }} />
              ))}
            </Box>
            <Button variant="contained" size="small" onClick={submitPartner} sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' } }}>Submit</Button>
          </Grid>
        </Grid>
      </Box>
    )}
  </Paper>
  );
};

export default OrderCard;




