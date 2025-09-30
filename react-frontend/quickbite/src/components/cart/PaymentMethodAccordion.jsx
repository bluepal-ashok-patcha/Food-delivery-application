import React from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Button, Typography } from '@mui/material';
import { ExpandMore, Payment, CreditCard, QrCodeScanner, AccountBalance } from '@mui/icons-material';

const PaymentMethodAccordion = ({ paymentMethod, setPaymentMethod }) => (
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
        <Button variant={paymentMethod === 'razorpay' ? 'contained' : 'outlined'} onClick={() => setPaymentMethod('razorpay')} startIcon={<Payment />} sx={{ justifyContent: 'flex-start', borderColor: '#fc8019', color: paymentMethod === 'razorpay' ? 'white' : '#fc8019', backgroundColor: paymentMethod === 'razorpay' ? '#fc8019' : 'transparent', '&:hover': { borderColor: '#e6730a', backgroundColor: paymentMethod === 'razorpay' ? '#e6730a' : '#fff5f0' }, borderRadius: '8px', py: 1, textTransform: 'none' }}>
          Razorpay (UPI/Card)
        </Button>
        <Button variant={paymentMethod === 'card' ? 'contained' : 'outlined'} onClick={() => setPaymentMethod('card')} startIcon={<CreditCard />} sx={{ justifyContent: 'flex-start', borderColor: '#fc8019', color: paymentMethod === 'card' ? 'white' : '#fc8019', backgroundColor: paymentMethod === 'card' ? '#fc8019' : 'transparent', '&:hover': { borderColor: '#e6730a', backgroundColor: paymentMethod === 'card' ? '#e6730a' : '#fff5f0' }, borderRadius: '8px', py: 1, textTransform: 'none' }}>
          Credit/Debit Card
        </Button>
        <Button variant={paymentMethod === 'upi' ? 'contained' : 'outlined'} onClick={() => setPaymentMethod('upi')} startIcon={<QrCodeScanner />} sx={{ justifyContent: 'flex-start', borderColor: '#fc8019', color: paymentMethod === 'upi' ? 'white' : '#fc8019', backgroundColor: paymentMethod === 'upi' ? '#fc8019' : 'transparent', '&:hover': { borderColor: '#e6730a', backgroundColor: paymentMethod === 'upi' ? '#e6730a' : '#fff5f0' }, borderRadius: '8px', py: 1, textTransform: 'none' }}>
          UPI Payment
        </Button>
        <Button variant={paymentMethod === 'cod' ? 'contained' : 'outlined'} onClick={() => setPaymentMethod('cod')} startIcon={<AccountBalance />} sx={{ justifyContent: 'flex-start', borderColor: '#fc8019', color: paymentMethod === 'cod' ? 'white' : '#fc8019', backgroundColor: paymentMethod === 'cod' ? '#fc8019' : 'transparent', '&:hover': { borderColor: '#e6730a', backgroundColor: paymentMethod === 'cod' ? '#e6730a' : '#fff5f0' }, borderRadius: '8px', py: 1, textTransform: 'none' }}>
          Cash on Delivery
        </Button>
      </Box>
    </AccordionDetails>
  </Accordion>
);

export default PaymentMethodAccordion;


