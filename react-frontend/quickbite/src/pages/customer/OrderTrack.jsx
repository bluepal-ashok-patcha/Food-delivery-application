import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Paper, Typography, Box, Chip, Button, Stepper, Step, StepLabel } from '@mui/material';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import DeliveryMap from '../../components/maps/DeliveryMap';

// Simple mock delivery partner location updates
const mockPath = [
  { lat: 17.4065, lng: 78.4772 },
  { lat: 17.4100, lng: 78.4800 },
  { lat: 17.4150, lng: 78.4850 },
  { lat: 17.4200, lng: 78.4900 }
];

const OrderTrack = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const order = orders.find(o => String(o.id) === String(id));
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!order) return;
    const statuses = ['placed', 'preparing', 'out_for_delivery', 'delivered'];
    setStepIndex(statuses.indexOf(order.status));
  }, [order]);

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>Order not found</Paper>
      </Container>
    );
  }

  // Mock path from restaurant to customer (use order lat/lng if available)
  const path = [
    { lat: 17.4065, lng: 78.4772 },
    { lat: 17.4100, lng: 78.4800 },
    { lat: 17.4150, lng: 78.4850 },
    { lat: 17.4200, lng: 78.4900 }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Track Order #{order.id}</Typography>
      <Paper sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
        <Stepper activeStep={stepIndex} alternativeLabel>
          {['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Reuse accurate map modal content by rendering the map section only */}
      <Paper sx={{ p: 2, borderRadius: '8px' }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>Delivery Partner Location</Typography>
        <Box sx={{ height: 360, width: '100%', position: 'relative', overflow: 'hidden' }}>
          <DeliveryMap
            key={`${order.id}-${stepIndex}`}
            path={path}
            initialCenter={path[0]}
            onReachedEnd={() => { /* could auto-mark delivered */ }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="outlined" sx={{ textTransform: 'none' }} href={`tel:9999999999`}>Call Delivery Partner</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderTrack;


