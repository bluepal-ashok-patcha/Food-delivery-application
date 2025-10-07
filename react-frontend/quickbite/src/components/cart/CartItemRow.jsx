import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { updateCartItemAsync, removeCartItemAsync, fetchCartPricing } from '../../store/slices/cartSlice';

const CartItemRow = ({ item, index, itemsLength, formatPrice }) => {
  const dispatch = useDispatch();

  const onInc = async () => {
    await dispatch(updateCartItemAsync({ menuItemId: item.id, quantity: item.quantity + 1, customization: item.customization }));
    await dispatch(fetchCartPricing());
  };

  const onDec = async () => {
    const nextQty = item.quantity - 1;
    if (nextQty <= 0) {
      await dispatch(removeCartItemAsync({ menuItemId: item.id, customization: item.customization }));
    } else {
      await dispatch(updateCartItemAsync({ menuItemId: item.id, quantity: nextQty, customization: item.customization }));
    }
    await dispatch(fetchCartPricing());
  };

  const onRemove = async () => {
    await dispatch(removeCartItemAsync({ menuItemId: item.id, customization: item.customization }));
    await dispatch(fetchCartPricing());
  };

  return (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5, fontSize: '16px' }}>{item.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '14px' }}>{formatPrice(item.price)} each</Typography>
          {item.customization && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '12px' }}>
              {typeof item.customization === 'string' ? item.customization : Array.isArray(item.customization) ? item.customization.join(', ') : typeof item.customization === 'object' && item.customization !== null ? Object.entries(item.customization).map(([key, value]) => `${key}: ${value}`).join(', ') : ''}
            </Typography>
          )}
          <Typography variant="body1" color="primary" sx={{ fontWeight: 600, fontSize: '14px' }}>Total: {formatPrice(item.price * item.quantity)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onDec} size="small" sx={{ border: '1px solid #fc8019', color: '#fc8019', width: '28px', height: '28px', '&:hover': { backgroundColor: '#fff5f0' } }}>
              <Remove sx={{ fontSize: '16px' }} />
            </IconButton>
            <Typography variant="body1" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: '16px' }}>{item.quantity}</Typography>
            <IconButton onClick={onInc} size="small" sx={{ backgroundColor: '#fc8019', color: 'white', width: '28px', height: '28px', '&:hover': { backgroundColor: '#e6730a' } }}>
              <Add sx={{ fontSize: '16px' }} />
            </IconButton>
          </Box>
          <IconButton onClick={onRemove} color="error" size="small">
            <Delete sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      </Box>
      {index < itemsLength - 1 && <Divider sx={{ mx: 2 }} />}
    </Box>
  );
};

export default CartItemRow;


