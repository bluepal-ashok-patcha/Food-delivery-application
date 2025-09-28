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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Close,
  LocalShipping,
  Payment,
  Discount,
  ShoppingCart
} from '@mui/icons-material';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { showNotification, closeCartModal } from '../../store/slices/uiSlice';
import { mockCoupons } from '../../constants/mockData';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';

const CartModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCartModalOpen } = useSelector((state) => state.ui);
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
      paymentMethod: 'card'
    };

    dispatch(createOrder(orderData));
    dispatch(closeCartModal());
    dispatch(showNotification({ 
      message: 'Order placed successfully!', 
      type: 'success' 
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Modal
      open={isCartModalOpen}
      onClose={() => dispatch(closeCartModal())}
      title="Your Cart"
      maxWidth="md"
      fullWidth
    >
      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: '#f8f9fa', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto', 
            mb: 2
          }}>
            <ShoppingCart sx={{ fontSize: 32, color: '#adb5bd' }} />
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '14px', color: '#666' }}>
            Add some delicious food to get started!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => dispatch(closeCartModal())}
            sx={{ 
              backgroundColor: '#fc8019', 
              '&:hover': { backgroundColor: '#e6730a' },
              px: 3,
              py: 1,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Browse Restaurants
          </Button>
        </Box>
      ) : (
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {/* Restaurant Info */}
          <Paper sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '6px', 
                backgroundColor: '#fc8019',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                  {restaurantName.charAt(0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
                  {restaurantName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                  {items.length} item{items.length > 1 ? 's' : ''} in cart
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Cart Items */}
          <Box sx={{ mb: 2 }}>
            {items.map((item, index) => (
              <Paper 
                key={`${item.id}-${index}`}
                sx={{ 
                  p: 2, 
                  mb: 1.5, 
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #f0f0f0'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '6px', 
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      fontSize: '16px', 
                      color: '#333',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#666', 
                      fontSize: '12px',
                      mb: 0.5
                    }}>
                      {formatPrice(item.price)} each
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: '#fc8019', 
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <IconButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      size="small"
                      sx={{ 
                        border: '1px solid #fc8019',
                        color: '#fc8019',
                        width: '28px',
                        height: '28px',
                        '&:hover': { 
                          backgroundColor: '#fff5f0'
                        }
                      }}
                    >
                      <Remove sx={{ fontSize: '14px' }} />
                    </IconButton>
                    
                    <Typography variant="body1" sx={{ 
                      minWidth: 24, 
                      textAlign: 'center', 
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333'
                    }}>
                      {item.quantity}
                    </Typography>
                    
                    <IconButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      size="small"
                      sx={{ 
                        backgroundColor: '#fc8019',
                        color: 'white',
                        width: '28px',
                        height: '28px',
                        '&:hover': { 
                          backgroundColor: '#e6730a'
                        }
                      }}
                    >
                      <Add sx={{ fontSize: '14px' }} />
                    </IconButton>
                    
                    <IconButton 
                      onClick={() => dispatch(removeFromCart({ itemId: item.id }))}
                      size="small"
                      sx={{ 
                        color: '#dc3545',
                        width: '28px',
                        height: '28px',
                        '&:hover': { 
                          backgroundColor: '#fff5f5'
                        }
                      }}
                    >
                      <Delete sx={{ fontSize: '14px' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Coupon Section */}
          <Paper sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: '8px',
            backgroundColor: 'white',
            border: '1px solid #f0f0f0'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', mb: 1.5, fontSize: '16px' }}>
              Apply Coupon
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <TextField
                fullWidth
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    '& fieldset': {
                      borderColor: '#e9ecef',
                    },
                    '&:hover fieldset': {
                      borderColor: '#fc8019',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fc8019',
                    },
                  }
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleApplyCoupon}
                loading={isApplyingCoupon}
                sx={{ 
                  borderColor: '#fc8019',
                  color: '#fc8019',
                  borderRadius: '6px',
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '13px',
                  '&:hover': { 
                    borderColor: '#e6730a', 
                    backgroundColor: '#fff5f0'
                  }
                }}
              >
                Apply
              </Button>
            </Box>
            
            {appliedCoupon && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1.5,
                backgroundColor: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <Chip 
                  label={`${appliedCoupon.code} applied`} 
                  size="small"
                  sx={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    fontWeight: 600,
                    fontSize: '12px',
                    '& .MuiChip-deleteIcon': {
                      color: '#155724'
                    }
                  }}
                  onDelete={() => dispatch(removeCoupon())}
                />
              </Box>
            )}
          </Paper>

          {/* Order Summary */}
          <Paper sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: '8px',
            backgroundColor: 'white',
            border: '1px solid #f0f0f0'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', mb: 2, fontSize: '16px' }}>
              Order Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '14px', color: '#666' }}>Subtotal</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{formatPrice(subtotal)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '14px', color: '#666' }}>Delivery Fee</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{formatPrice(deliveryFee)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '14px', color: '#666' }}>Tax</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{formatPrice(tax)}</Typography>
            </Box>
            
            {appliedCoupon && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '14px', color: '#28a745', fontWeight: 600 }}>
                  Discount ({appliedCoupon.code})
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#28a745', fontWeight: 600 }}>
                  -{formatPrice((subtotal * appliedCoupon.discountValue) / 100)}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2, borderColor: '#e9ecef' }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', fontSize: '18px' }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fc8019', fontSize: '18px' }}>
                {formatPrice(total)}
              </Typography>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                dispatch(closeCartModal());
                navigate('/cart');
              }}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: '#fc8019',
                color: '#fc8019',
                '&:hover': {
                  borderColor: '#e6730a',
                  backgroundColor: '#fff5f0',
                },
              }}
            >
              View Full Cart
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Payment />}
              onClick={handlePlaceOrder}
              sx={{
                py: 1.5,
                backgroundColor: '#fc8019',
                '&:hover': {
                  backgroundColor: '#e6730a'
                },
                fontWeight: 600,
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Place Order
            </Button>
          </Box>
        </Box>
      )}
    </Modal>
  );
};

export default CartModal;
