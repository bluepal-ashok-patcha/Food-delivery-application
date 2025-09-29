import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, Button, IconButton, Divider, TextField, Chip, Grid, Card, CardContent, Avatar, Badge, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { Add, Remove, Delete, LocalShipping, ArrowBack, LocationOn, Star } from '@mui/icons-material';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { mockCoupons } from '../../constants/mockData';
import { useNavigate } from 'react-router-dom';
import CartHeader from '../../components/cart/CartHeader';
import CartItemRow from '../../components/cart/CartItemRow';
import CouponAccordion from '../../components/cart/CouponAccordion';
import PaymentMethodAccordion from '../../components/cart/PaymentMethodAccordion';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, tax, total, restaurantName, appliedCoupon } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const steps = ['Cart', 'Delivery', 'Payment', 'Confirm'];

  const handleQuantityChange = (itemId, customization, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ itemId, customization }));
    } else {
      dispatch(updateQuantity({ itemId, customization, quantity: newQuantity }));
    }
  };

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    const coupon = mockCoupons.find(c => c.code === couponCode.toUpperCase());
    
    setTimeout(() => {
      if (coupon) {
        dispatch(applyCoupon(coupon));
        dispatch(showNotification({ 
          message: 'Coupon applied successfully!', 
          type: 'success' 
        }));
      } else {
        dispatch(showNotification({ 
          message: 'Invalid coupon code', 
          type: 'error' 
        }));
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handlePlaceOrder = () => {
    if (!user) {
      dispatch(showNotification({ 
        message: 'Please login to place an order', 
        type: 'error' 
      }));
      return;
    }

    setIsProcessing(true);
    
    const orderData = {
      customerId: user.id,
      restaurantId: items[0]?.restaurantId,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization
      })),
      subtotal,
      deliveryFee,
      tax,
      total,
      deliveryAddress: user.addresses?.[0]?.address || 'No address provided',
      paymentMethod,
      deliveryInstructions
    };

    setTimeout(() => {
      dispatch(createOrder(orderData));
      dispatch(showNotification({ 
        message: 'Order placed successfully!', 
        type: 'success' 
      }));
      setIsProcessing(false);
      navigate('/orders');
    }, 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
        <CartHeader onBack={() => navigate(-1)} />

        {/* Empty Cart */}
        <Container maxWidth="md" sx={{ py: 4, px: { xs: 1, sm: 2 }, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center', maxWidth: '400px', mx: 'auto' }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mx: 'auto', 
              mb: 2 
            }}>
              <LocalShipping sx={{ fontSize: 32, color: '#999' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#333', fontSize: '20px' }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '14px' }}>
              Add some delicious food to get started!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ 
                backgroundColor: '#fc8019',
                '&:hover': { backgroundColor: '#e6730a' },
                px: 3,
                py: 1,
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Browse Restaurants
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      <CartHeader onBack={() => navigate(-1)} />

      {/* Progress Stepper */}
      <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>

      <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 2 }, flexGrow: 1 }}>
        <Grid container spacing={2}>
          {/* Left Column - Cart Items */}
          <Grid item xs={12} md={8}>
            {/* Restaurant Info */}
            <Card sx={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, backgroundColor: '#fc8019' }}>
                    <Star sx={{ color: 'white', fontSize: '20px' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
                      {restaurantName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      {items.length} item{items.length > 1 ? 's' : ''} in cart
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 2 }}>
              <CardContent sx={{ p: 0 }}>
                {items.map((item, index) => (
                  <CartItemRow
                    key={`${item.id}-${index}`}
                    item={item}
                    index={index}
                    itemsLength={items.length}
                    onDec={() => handleQuantityChange(item.id, item.customization, item.quantity - 1)}
                    onInc={() => handleQuantityChange(item.id, item.customization, item.quantity + 1)}
                    onRemove={() => dispatch(removeFromCart({ itemId: item.id, customization: item.customization }))}
                    formatPrice={formatPrice}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card sx={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOn sx={{ color: '#fc8019', fontSize: '20px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
                    Delivery Information
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 0.5 }}>
                    Delivery Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                    {user?.addresses?.[0]?.address || 'No address provided'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 0.5 }}>
                    Delivery Instructions (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. Leave at the gate, call upon arrival"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    size="small"
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        fontSize: '14px'
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
                  Order Summary
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>{formatPrice(subtotal)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>Delivery Fee</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>{formatPrice(deliveryFee)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>Tax</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>{formatPrice(tax)}</Typography>
                  </Box>
                  
                  {appliedCoupon && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" color="success.main" sx={{ fontSize: '14px' }}>Discount ({appliedCoupon.code})</Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500, fontSize: '14px' }}>
                        -{formatPrice((subtotal * appliedCoupon.discountValue) / 100)}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fc8019', fontSize: '16px' }}>
                    {formatPrice(total)}
                  </Typography>
                </Box>

                <CouponAccordion couponCode={couponCode} setCouponCode={setCouponCode} isApplying={isApplyingCoupon} onApply={handleApplyCoupon} appliedCoupon={appliedCoupon} onRemoveCoupon={() => dispatch(removeCoupon())} />
                <PaymentMethodAccordion paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

                <OrderSummaryCard subtotal={subtotal} deliveryFee={deliveryFee} tax={tax} total={total} appliedCoupon={appliedCoupon} onPlaceOrder={handlePlaceOrder} isProcessing={isProcessing} formatPrice={formatPrice} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;