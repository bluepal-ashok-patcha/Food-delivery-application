import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  TextField,
  Chip,
  Paper,
  Container,
  Grid,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, Payment } from '@mui/icons-material';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { mockCoupons } from '../../constants/mockData';
import { useNavigate } from 'react-router-dom';
import useRazorpay from '../../hooks/useRazorpay';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, tax, total, restaurantName, appliedCoupon } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ itemId }));
    } else {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }));
    }
  };

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    const coupon = mockCoupons.find(c => c.code === couponCode.toUpperCase());
    
    setTimeout(() => {
      if (coupon) {
        dispatch(applyCoupon(coupon));
        dispatch(showNotification({ message: 'Coupon applied!', type: 'success' }));
      } else {
        dispatch(showNotification({ message: 'Invalid coupon code', type: 'error' }));
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handlePaymentSuccess = (response) => {
    const orderData = {
      paymentId: response.paymentId,
      orderId: response.orderId,
      items,
      total,
      restaurantName,
      deliveryAddress: user.addresses?.[0] || '123 Default St',
    };
    dispatch(createOrder(orderData));
    dispatch(showNotification({ message: 'Payment successful! Order placed.', type: 'success' }));
    navigate('/orders');
  };

  const handlePaymentFailure = (error) => {
    dispatch(showNotification({ message: `Payment failed: ${error.reason}`, type: 'error' }));
  };

  const { openPaymentModal } = useRazorpay({
    onSuccess: handlePaymentSuccess,
    onFailure: handlePaymentFailure,
  });

  const handlePlaceOrder = () => {
    if (!user) {
      dispatch(showNotification({ message: 'Please login to place an order', type: 'error' }));
      return;
    }

    openPaymentModal({
      amount: total,
      orderId: `order_${Date.now()}`, // Mock order ID
      userDetails: {
        name: user.name,
        email: user.email,
        phone: '9999999999', // Mock phone
      },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price || 0);
  };

  if (items.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Browse Restaurants
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Your Cart from {restaurantName}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Cart Items */}
          {items.map((item) => (
            <Paper key={item.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
              <img src={item.image} alt={item.name} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 16 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.name}</Typography>
                <Typography color="text.secondary">{formatPrice(item.price)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                  <Remove />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                  <Add />
                </IconButton>
              </Box>
              <Typography sx={{ width: 100, textAlign: 'right', fontWeight: 600 }}>
                {formatPrice(item.price * item.quantity)}
              </Typography>
              <IconButton sx={{ ml: 2 }} onClick={() => dispatch(removeFromCart({ itemId: item.id }))}>
                <Delete />
              </IconButton>
            </Paper>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Order Summary</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>{formatPrice(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Delivery Fee</Typography>
              <Typography>{formatPrice(deliveryFee)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Tax</Typography>
              <Typography>{formatPrice(tax)}</Typography>
            </Box>
            {/* Coupon Section */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outlined" onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                Apply
              </Button>
            </Box>
            {appliedCoupon && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main', mb: 2 }}>
                <Typography>Discount ({appliedCoupon.code})</Typography>
                <Typography>-{formatPrice((subtotal * appliedCoupon.discountValue) / 100)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatPrice(total)}</Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Payment />}
              onClick={handlePlaceOrder}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;