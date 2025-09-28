import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  IconButton,
  Divider,
  TextField,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add, 
  Remove, 
  Delete, 
  LocalShipping,
  Payment,
  ArrowBack,
  Discount,
  LocationOn,
  Timer,
  Star,
  ExpandMore,
  CreditCard,
  AccountBalance,
  QrCodeScanner
} from '@mui/icons-material';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { mockCoupons } from '../../constants/mockData';
import { useNavigate } from 'react-router-dom';

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
        {/* Header */}
        <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', py: 1.5 }}>
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: '#333', p: 0.5 }}>
                <ArrowBack sx={{ fontSize: '20px' }} />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
                Your Cart
              </Typography>
            </Box>
          </Container>
        </Box>

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
      {/* Header */}
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', py: 1.5 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: '#333', p: 0.5 }}>
              <ArrowBack sx={{ fontSize: '20px' }} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
              Your Cart
            </Typography>
          </Box>
        </Container>
      </Box>

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

            {/* Cart Items */}
            <Card sx={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mb: 2 }}>
              <CardContent sx={{ p: 0 }}>
                {items.map((item, index) => (
                  <Box key={`${item.id}-${index}`}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img 
                          src={item.image} 
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5, fontSize: '16px' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '14px' }}>
                          {formatPrice(item.price)} each
                        </Typography>
                        {item.customization && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '12px' }}>
                            {typeof item.customization === 'string'
                              ? item.customization
                              : Array.isArray(item.customization)
                                ? item.customization.join(', ')
                                : typeof item.customization === 'object' && item.customization !== null
                                  ? Object.entries(item.customization).map(([key, value]) => `${key}: ${value}`).join(', ')
                                  : ''}
                          </Typography>
                        )}
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 600, fontSize: '14px' }}>
                          Total: {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            onClick={() => handleQuantityChange(item.id, item.customization, item.quantity - 1)}
                            size="small"
                            sx={{ 
                              border: '1px solid #fc8019',
                              color: '#fc8019',
                              width: '28px',
                              height: '28px',
                              '&:hover': { backgroundColor: '#fff5f0' }
                            }}
                          >
                            <Remove sx={{ fontSize: '16px' }} />
                          </IconButton>
                          
                          <Typography variant="body1" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: '16px' }}>
                            {item.quantity}
                          </Typography>
                          
                          <IconButton 
                            onClick={() => handleQuantityChange(item.id, item.customization, item.quantity + 1)}
                            size="small"
                            sx={{ 
                              backgroundColor: '#fc8019',
                              color: 'white',
                              width: '28px',
                              height: '28px',
                              '&:hover': { backgroundColor: '#e6730a' }
                            }}
                          >
                            <Add sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Box>
                        
                        <IconButton 
                          onClick={() => dispatch(removeFromCart({ itemId: item.id, customization: item.customization }))}
                          color="error"
                          size="small"
                        >
                          <Delete sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {index < items.length - 1 && <Divider sx={{ mx: 2 }} />}
                  </Box>
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

                {/* Coupon Section */}
                <Accordion sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Discount sx={{ color: '#fc8019', fontSize: '18px' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>
                        Apply Coupon
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            fontSize: '14px'
                          }
                        }}
                      />
                      <Button 
                        variant="outlined" 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        sx={{ 
                          borderColor: '#fc8019',
                          color: '#fc8019',
                          borderRadius: '8px',
                          px: 2,
                          py: 0.75,
                          fontSize: '14px',
                          minWidth: '80px',
                          '&:hover': { borderColor: '#e6730a', backgroundColor: '#fff5f0' }
                        }}
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </Box>
                    
                    {appliedCoupon && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={`${appliedCoupon.code} applied`} 
                          color="success" 
                          onDelete={() => dispatch(removeCoupon())}
                          sx={{ fontWeight: 500, fontSize: '12px' }}
                        />
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>

                {/* Payment Method */}
                <Accordion sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Payment sx={{ color: '#fc8019', fontSize: '18px' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>
                        Payment Method
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                        onClick={() => setPaymentMethod('card')}
                        startIcon={<CreditCard />}
                        sx={{ 
                          justifyContent: 'flex-start',
                          borderColor: '#fc8019',
                          color: paymentMethod === 'card' ? 'white' : '#fc8019',
                          backgroundColor: paymentMethod === 'card' ? '#fc8019' : 'transparent',
                          '&:hover': { 
                            borderColor: '#e6730a',
                            backgroundColor: paymentMethod === 'card' ? '#e6730a' : '#fff5f0' 
                          },
                          borderRadius: '8px',
                          py: 1,
                          textTransform: 'none'
                        }}
                      >
                        Credit/Debit Card
                      </Button>
                      
                      <Button
                        variant={paymentMethod === 'upi' ? 'contained' : 'outlined'}
                        onClick={() => setPaymentMethod('upi')}
                        startIcon={<QrCodeScanner />}
                        sx={{ 
                          justifyContent: 'flex-start',
                          borderColor: '#fc8019',
                          color: paymentMethod === 'upi' ? 'white' : '#fc8019',
                          backgroundColor: paymentMethod === 'upi' ? '#fc8019' : 'transparent',
                          '&:hover': { 
                            borderColor: '#e6730a',
                            backgroundColor: paymentMethod === 'upi' ? '#e6730a' : '#fff5f0' 
                          },
                          borderRadius: '8px',
                          py: 1,
                          textTransform: 'none'
                        }}
                      >
                        UPI Payment
                      </Button>
                      
                      <Button
                        variant={paymentMethod === 'cod' ? 'contained' : 'outlined'}
                        onClick={() => setPaymentMethod('cod')}
                        startIcon={<AccountBalance />}
                        sx={{ 
                          justifyContent: 'flex-start',
                          borderColor: '#fc8019',
                          color: paymentMethod === 'cod' ? 'white' : '#fc8019',
                          backgroundColor: paymentMethod === 'cod' ? '#fc8019' : 'transparent',
                          '&:hover': { 
                            borderColor: '#e6730a',
                            backgroundColor: paymentMethod === 'cod' ? '#e6730a' : '#fff5f0' 
                          },
                          borderRadius: '8px',
                          py: 1,
                          textTransform: 'none'
                        }}
                      >
                        Cash on Delivery
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Place Order Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  sx={{ 
                    py: 1.5,
                    backgroundColor: '#fc8019',
                    '&:hover': { backgroundColor: '#e6730a' },
                    '&:disabled': { backgroundColor: '#f0f0f0', color: '#999' },
                    fontWeight: 600,
                    fontSize: '16px',
                    borderRadius: '8px',
                    textTransform: 'none'
                  }}
                >
                  {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </Button>
                
                <Alert severity="info" sx={{ mt: 2, fontSize: '12px' }}>
                  By placing this order, you agree to our Terms & Conditions
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;