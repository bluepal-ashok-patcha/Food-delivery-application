import React from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Chip, Typography } from '@mui/material';
import { ExpandMore, Discount } from '@mui/icons-material';

const CouponAccordion = ({ couponCode, setCouponCode, isApplying, onApply, appliedCoupon, onRemoveCoupon }) => (
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
        <TextField fullWidth placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '14px' } }} />
        <Button variant="outlined" onClick={onApply} disabled={isApplying} sx={{ borderColor: '#fc8019', color: '#fc8019', borderRadius: '8px', px: 2, py: 0.75, fontSize: '14px', minWidth: '80px', '&:hover': { borderColor: '#e6730a', backgroundColor: '#fff5f0' } }}>
          {isApplying ? 'Applying...' : 'Apply'}
        </Button>
      </Box>
      {appliedCoupon && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={`${appliedCoupon.code} applied`} color="success" onDelete={onRemoveCoupon} sx={{ fontWeight: 500, fontSize: '12px' }} />
        </Box>
      )}
    </AccordionDetails>
  </Accordion>
);

export default CouponAccordion;


