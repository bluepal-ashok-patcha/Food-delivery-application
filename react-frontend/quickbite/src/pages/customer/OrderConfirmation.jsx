import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Paper, Typography, Box, Divider, Button, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { currentOrder, orders } = useSelector((state) => state.orders);
  const order = currentOrder || orders[0];

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: '3px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No recent order</Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' } }}>
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  const eta = '30-40 mins';
  const paymentStatus = order.paymentStatus || 'PENDING';

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Order Confirmed!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Order ID: #{order.id}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Payment Status:</Typography>
          <Chip size="small" label={paymentStatus} color={paymentStatus === 'PAID' ? 'success' : paymentStatus === 'FAILED' ? 'error' : 'warning'} />
        </Box>
        {paymentStatus !== 'PAID' && (
          <Alert severity="info" sx={{ mb: 2 }}>Payment will be marked as PAID after the payment service webhook confirms success.</Alert>
        )}
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '3px', border: '1px solid #f0f0f0', mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Estimated Delivery: {eta}</Typography>
          <Typography variant="body2" color="text.secondary">We'll notify you as the order progresses.</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Summary</Typography>
        {order.items.map((it, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{it.quantity}x {it.name}</Typography>
            <Typography variant="body2">₹{(it.price * it.quantity).toFixed(0)}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#fc8019' }}>₹{(order.total || order.totalAmount || 0).toFixed(0)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => navigate('/orders')}>View Orders</Button>
          {paymentStatus === 'PAID' || paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS' ? (
            <Button variant="contained" sx={{ textTransform: 'none', backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' } }} onClick={() => navigate(`/orders/${order.id}`)}>Track Order</Button>
          ) : (
            <Button variant="outlined" disabled sx={{ textTransform: 'none', color: '#666', borderColor: '#ccc' }}>Payment Pending</Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;


