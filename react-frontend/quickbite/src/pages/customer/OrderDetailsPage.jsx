import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { LocalShipping, Restaurant, CheckCircle, Home } from '@mui/icons-material';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const steps = [
  { label: 'Order Placed', icon: <CheckCircle /> },
  { label: 'Preparing Food', icon: <Restaurant /> },
  { label: 'Out for Delivery', icon: <LocalShipping /> },
  { label: 'Delivered', icon: <Home /> },
];

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { items: orders, loading } = useSelector((state) => state.orders);
  const order = orders.find((o) => o.id.toString() === orderId);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (order) {
      const statusMap = {
        'Order Placed': 0,
        'Preparing': 1,
        'Out for Delivery': 2,
        'Delivered': 3,
      };

      // Set initial step based on order status
      const initialStep = statusMap[order.status] || 0;
      setActiveStep(initialStep);

      // Mock real-time updates if the order is not delivered
      if (initialStep < 3) {
        const interval = setInterval(() => {
          setActiveStep((prevActiveStep) => {
            if (prevActiveStep < 3) {
              return prevActiveStep + 1;
            }
            clearInterval(interval);
            return prevActiveStep;
          });
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
      }
    }
  }, [order]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!order) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">Order not found</Typography>
        <Button component={Link} to="/orders" sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Order #{order.id}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          from {order.restaurantName}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Status
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => React.cloneElement(step.icon, {
                      color: activeStep >= index ? 'primary' : 'disabled',
                    })}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            {order.items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{item.quantity}x {item.name}</Typography>
                <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <Typography>Total</Typography>
              <Typography>${order.total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailsPage;