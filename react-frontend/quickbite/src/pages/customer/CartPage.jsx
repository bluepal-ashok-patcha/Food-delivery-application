import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, Button, IconButton, Divider, TextField, Chip, Grid, Card, CardContent, Avatar, Badge, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { Add, Remove, Delete, LocalShipping, ArrowBack, LocationOn, Star } from '@mui/icons-material';
import { updateCartItemAsync, removeCartItemAsync, removeCouponAsync, clearCartAsync, applyCouponAsync, fetchCartPricing, checkoutAndPlaceOrder } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { mockRestaurants } from '../../constants/mockData';
import { useNavigate } from 'react-router-dom';
import { paymentAPI, deliveryAPI } from '../../services/api';
import CartHeader from '../../components/cart/CartHeader';
import CartItemRow from '../../components/cart/CartItemRow';
import { fetchCart } from '../../store/slices/cartSlice';
import CouponAccordion from '../../components/cart/CouponAccordion';
import PaymentMethodAccordion from '../../components/cart/PaymentMethodAccordion';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, tax, total, restaurantName, appliedCoupon, appliedCouponCode } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const steps = ['Cart', 'Delivery', 'Payment', 'Confirm'];

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = async (itemId, customization, newQuantity) => {
    if (newQuantity <= 0) {
      await dispatch(removeCartItemAsync({ menuItemId: itemId, customization })).unwrap();
    } else {
      await dispatch(updateCartItemAsync({ menuItemId: itemId, quantity: newQuantity, customization })).unwrap();
    }
    await dispatch(fetchCartPricing());
  };

  const handleApplyCoupon = async () => {
    setIsApplyingCoupon(true);
    try {
      await dispatch(applyCouponAsync({ code: couponCode })).unwrap();
      await dispatch(fetchCartPricing());
      dispatch(showNotification({ message: 'Coupon applied successfully!', type: 'success' }));
    } catch (e) {
      dispatch(showNotification({ message: e || 'Invalid coupon code', type: 'error' }));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    if (!user) {
      dispatch(showNotification({ 
        message: 'Please login to place an order', 
        type: 'error' 
      }));
      return;
    }

    setIsProcessing(true);
    
    // Get restaurant and user delivery coordinates
    const restaurantId = items[0]?.restaurantId;
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    const restaurantLocation = restaurant?.location || { lat: 0, lng: 0 };
    const deliveryAddressObj = user.addresses?.[0];
    const deliveryLocation = deliveryAddressObj
      ? { lat: deliveryAddressObj.latitude, lng: deliveryAddressObj.longitude }
      : { lat: 0, lng: 0 };

    const orderData = {
      customerId: user.id,
      restaurantId,
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
      deliveryAddress: deliveryAddressObj?.address || 'No address provided',
      paymentMethod,
      deliveryInstructions,
      restaurantLocation,
      deliveryLocation
    };

    const proceedCreate = async () => {
      try {
        // If you want to bypass payment flow, call createOrder directly
        const result = await dispatch(createOrder(orderData)).unwrap();
        dispatch(showNotification({ message: 'Order placed successfully!', type: 'success' }));
        dispatch(clearCart());
        navigate('/orders/confirmation');
      } catch (e) {
        dispatch(showNotification({ message: e || 'Failed to place order', type: 'error' }));
      } finally {
        setIsProcessing(false);
      }
    };

    if (paymentMethod === 'razorpay') {
      const loaded = await loadRazorpay();
      if (!loaded) {
        dispatch(showNotification({ message: 'Payment SDK failed to load', type: 'error' }));
        setIsProcessing(false);
        return;
      }

      try {
        // 1. First create order from cart to get orderId
        const addressId = user?.addresses?.[0]?.id || 1;
        const orderResult = await dispatch(checkoutAndPlaceOrder({ 
          paymentMethod: 'razorpay', 
          addressId, 
          specialInstructions: deliveryInstructions 
        })).unwrap();
        
        if (!orderResult || !orderResult.id) {
          throw new Error('Failed to create order');
        }

        // 2. Create payment intent with orderId
        const paymentIntent = await paymentAPI.createPaymentIntent(total, 'INR', orderResult.id);
        console.log('Payment intent response:', paymentIntent);
        const razorpayOrderId = paymentIntent.data?.id; // Razorpay order ID is in the 'id' field

        if (!razorpayOrderId) {
          console.error('No Razorpay order ID found in response:', paymentIntent);
          throw new Error('Failed to create payment intent - no Razorpay order ID returned');
        }

        // 3. Open Razorpay with the backend-generated order ID
        const options = {
          key: 'rzp_test_R6s6aVW39Oqimg', // Replace with your Razorpay key
          order_id: razorpayOrderId, // Use backend-generated order ID
          name: 'QuickBite',
          description: `Payment to ${restaurantName}`,
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@example.com',
            contact: user?.phone || '9999999999'
          },
          theme: { color: '#fc8019' },
          handler: async function (response) {
            try {
              // Verify payment with backend
              const verifyResult = await paymentAPI.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              
              if (verifyResult.success) {
                // Create delivery assignment (idempotent on backend if already exists)
                try {
                  await deliveryAPI.createAssignment(orderResult.id);
                } catch (e) {
                  // Ignore if already assigned or partner not available; proceed to tracking
                }
                dispatch(showNotification({ message: 'Payment successful! Redirecting to tracking…', type: 'success' }));
                navigate(`/orders/${orderResult.id}`);
              } else {
                dispatch(showNotification({ message: 'Payment verification failed', type: 'error' }));
              }
            } catch (e) {
              const errorMessage = e instanceof Error ? e.message : (e || 'Payment processing failed');
              dispatch(showNotification({ message: errorMessage, type: 'error' }));
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => setIsProcessing(false)
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : (e || 'Failed to initialize payment');
        dispatch(showNotification({ message: errorMessage, type: 'error' }));
        setIsProcessing(false);
      }
    } else {
      proceedCreate();
    }
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
          <Grid item xs={12} md={9} lg={9}>
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
          <Grid item xs={12} md={3} lg={3}>
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

                <CouponAccordion couponCode={couponCode} setCouponCode={setCouponCode} isApplying={isApplyingCoupon} onApply={handleApplyCoupon} appliedCoupon={appliedCoupon} appliedCouponCode={appliedCouponCode} onRemoveCoupon={async () => { await dispatch(removeCouponAsync()).unwrap(); await dispatch(fetchCartPricing()); }} />
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