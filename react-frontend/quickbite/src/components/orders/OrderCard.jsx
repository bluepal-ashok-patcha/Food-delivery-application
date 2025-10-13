import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Chip, Grid, Divider, Button, Avatar } from '@mui/material';
import { Restaurant, LocalShipping, Receipt, Star } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { submitRestaurantReview, submitPartnerReview } from '../../store/slices/reviewsSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { restaurantAPI, orderAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import RatingModal from '../modals/RatingModal';

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
  const navigate = useNavigate();
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({ restaurantReviewed: false, deliveryReviewed: false });
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [restaurantImage, setRestaurantImage] = useState(null);

  // Normalize backend fields
  const id = order.id;
  const createdAt = order.createdAt || order.orderDate;
  const total = (order.totalAmount != null ? order.totalAmount : (order.total || 0));
  const items = order.items || [];
  const statusRaw = (order.orderStatus || order.status || '').toString().toUpperCase();
  const status = statusRaw === 'PENDING' ? 'placed'
    : statusRaw === 'PREPARING' || statusRaw === 'ACCEPTED' || statusRaw === 'READY_FOR_PICKUP' ? 'preparing'
    : statusRaw === 'OUT_FOR_DELIVERY' ? 'out_for_delivery'
    : statusRaw === 'DELIVERED' ? 'delivered'
    : statusRaw === 'CANCELLED' ? 'cancelled'
    : (order.status || 'placed');
  const isActive = ['placed','preparing','out_for_delivery'].includes(status);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        if (order.restaurantId) {
          const res = await restaurantAPI.getRestaurantById(order.restaurantId);
          const data = res?.data || res;
          if (!cancel) {
            if (data?.name) setRestaurantName(data.name);
            if (data?.image) setRestaurantImage(data.image);
          }
        }
      } catch (_) {}
    })();
    return () => { cancel = true; };
  }, [order.restaurantId]);

  // Helper to normalize various API payload shapes and value types to booleans
  const normalizeReviewStatus = (raw) => {
    const data = raw || {};
    const toBool = (v) => {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v > 0;
      if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
      return false;
    };
    return {
      restaurantReviewed: toBool(data.restaurantReviewed),
      deliveryReviewed: toBool(data.deliveryReviewed)
    };
  };

  // Check review status for delivered orders
  useEffect(() => {
    const isDelivered = order?.orderStatus === 'DELIVERED' || order?.status === 'DELIVERED' || status === 'delivered';
    if (isDelivered && order?.id) {
      console.log('Fetching review status for order:', order.id, 'status:', order?.orderStatus || order?.status);
      setReviewStatus({ restaurantReviewed: false, deliveryReviewed: false });
      orderAPI.getOrderReviewStatus(order.id)
        .then(payload => {
          console.log('Review status response:', payload);
          setReviewStatus(normalizeReviewStatus(payload));
        })
        .catch(error => {
          console.error('Error fetching review status:', error);
        });
    }
  }, [order?.orderStatus, order?.status, status, order?.id]);

  const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(n || 0));


  return (
  <Paper sx={{ p: 2, borderRadius: '3px', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={restaurantImage || undefined} alt={restaurantName} sx={{ width: 40, height: 40, borderRadius: '3px' }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '15px' }}>{restaurantName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            {createdAt ? `${new Date(createdAt).toLocaleDateString()} · ${new Date(createdAt).toLocaleTimeString()}` : ''}
          </Typography>
        </Box>
      </Box>
      <Chip label={statusText(status)} color={statusColor(status)} size="small" sx={{ fontSize: '11px', height: '24px' }} />
    </Box>
    <Divider sx={{ my: 1.5 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Restaurant sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>Restaurant</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px', mb: 1 }}>{order.restaurantName || restaurantName}</Typography>
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
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontSize: '13px' }}>{item.quantity}x {item.name}</Typography>
            <Typography variant="body2" sx={{ fontSize: '13px' }}>{inr((item.price || 0) * (item.quantity || 1))}</Typography>
          </Box>
        ))}
        <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, fontSize: '16px', color: '#fc8019' }}>
          Total: {inr(total)}
        </Typography>
      </Grid>
    </Grid>
    {isActive && (() => {
      const paymentStatus = (order.paymentStatus || order.payment_state || '').toUpperCase();
      const canTrack = paymentStatus === 'COMPLETED' || paymentStatus === 'PAID' || paymentStatus === 'SUCCESS';
      
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
          {canTrack ? (
            <Button variant="contained" onClick={() => navigate(`/orders/${id}`)} sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' } }}>
              Track Order
            </Button>
          ) : (
            <Button variant="outlined" disabled sx={{ textTransform: 'none', color: '#666', borderColor: '#ccc' }}>
              Payment Pending
            </Button>
          )}
        </Box>
      );
    })()}
    {status === 'delivered' && (!reviewStatus.restaurantReviewed || !reviewStatus.deliveryReviewed) && (
      <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: '3px', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '12px' }}>
          {!reviewStatus.restaurantReviewed && !reviewStatus.deliveryReviewed ? 'How was your experience?' : 'Complete your rating'}
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => setRatingModalOpen(true)}
          startIcon={<Star />}
          sx={{ 
            textTransform: 'none', 
            backgroundColor: '#fc8019', 
            '&:hover': { backgroundColor: '#e6730a' },
            borderRadius: '3px',
            px: 2
          }}
        >
          {!reviewStatus.restaurantReviewed && !reviewStatus.deliveryReviewed ? 'Rate Order' : 'Complete Rating'}
        </Button>
      </Box>
    )}
    {status === 'delivered' && reviewStatus.restaurantReviewed && reviewStatus.deliveryReviewed && (
      <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#e8f5e8', borderRadius: '3px', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', color: '#4caf50' }}>
          ✓ Thank you for your feedback!
        </Typography>
      </Box>
    )}
    {/* Debug info - remove this later
    {status === 'delivered' && (
      <Box sx={{ mt: 1, p: 1, backgroundColor: '#f0f0f0', borderRadius: '3px', fontSize: '10px' }}>
        <Typography variant="caption" color="text.secondary">
          Debug: Status={status}, RestaurantReviewed={reviewStatus.restaurantReviewed ? 'true' : 'false'}, DeliveryReviewed={reviewStatus.deliveryReviewed ? 'true' : 'false'}
        </Typography>
      </Box>
    )} */}

    {/* Rating Modal */}
    <RatingModal
      open={ratingModalOpen}
      onClose={() => setRatingModalOpen(false)}
      order={order}
      assignment={null} // OrderCard doesn't have assignment data
      onReviewSubmitted={() => {
        // Refresh review status after submission
        if (order?.id) {
          orderAPI.getOrderReviewStatus(order.id)
            .then(payload => {
              setReviewStatus(normalizeReviewStatus(payload));
            })
            .catch(error => {
              console.error('Error fetching review status:', error);
            });
        }
      }}
    />
  </Paper>
  );
};

export default OrderCard;




