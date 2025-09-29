import React from 'react';
import { Box, Card, CardContent, Typography, Divider, Alert, Button, CircularProgress } from '@mui/material';

const OrderSummaryCard = ({ subtotal, deliveryFee, tax, total, appliedCoupon, onRemoveCoupon, onPlaceOrder, isProcessing, formatPrice }) => (
  <Card sx={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 20 }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>Order Summary</Typography>
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
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>Total</Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#fc8019', fontSize: '16px' }}>{formatPrice(total)}</Typography>
      </Box>
      <Button variant="contained" fullWidth startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null} onClick={onPlaceOrder} disabled={isProcessing} sx={{ py: 1.5, backgroundColor: '#fc8019', '&:hover': { backgroundColor: '#e6730a' }, '&:disabled': { backgroundColor: '#f0f0f0', color: '#999' }, fontWeight: 600, fontSize: '16px', borderRadius: '8px', textTransform: 'none' }}>
        {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
      </Button>
      <Alert severity="info" sx={{ mt: 2, fontSize: '12px' }}>By placing this order, you agree to our Terms & Conditions</Alert>
    </CardContent>
  </Card>
);

export default OrderSummaryCard;


