import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Paper, Typography, Box, Chip, Button, Stepper, Step, StepLabel } from '@mui/material';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import { deliveryAPI, orderAPI } from '../../services/api';
import DeliveryMap from '../../components/maps/DeliveryMap';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  const [orderData, setOrderData] = useState(null);
  const orderObj = order || orderData;
  const [stepIndex, setStepIndex] = useState(0);
  const [assignment, setAssignment] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!orderObj) return;
    const o = (orderObj.orderStatus || orderObj.status || '').toUpperCase();
    const d = (assignment && assignment.status ? assignment.status : '').toUpperCase();
    let idx = 0;
    if (o === 'DELIVERED' || d === 'DELIVERED') {
      idx = 3;
    } else if (
      o === 'OUT_FOR_DELIVERY' ||
      d === 'HEADING_TO_DELIVERY' || d === 'ARRIVED_AT_DELIVERY' || d === 'PICKED_UP'
    ) {
      idx = 2;
    } else if (
      o === 'PREPARING' || o === 'ACCEPTED' || o === 'READY_FOR_PICKUP' ||
      d === 'ACCEPTED' || d === 'HEADING_TO_PICKUP' || d === 'ARRIVED_AT_PICKUP'
    ) {
      idx = 1;
    } else {
      idx = 0; // PENDING or initial
    }
    setStepIndex(idx);
  }, [orderObj, assignment]);

  // Fetch order by ID if not in store
  useEffect(() => {
    if (order || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await orderAPI.getOrderById(id);
        if (!cancelled) setOrderData(res?.data || res);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [id, order]);

  // One-time check if an assignment already exists (in case it was created earlier)
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await deliveryAPI.getAssignmentByOrder(id);
        const a = res?.data;
        if (a && a.id) setAssignment(a);
      } catch (_) {}
    })();
  }, [id]);

  // Poll assignment every 5 seconds ONLY after an assignment exists, until terminal status
  useEffect(() => {
    if (!id || !assignment || !assignment.id) return;
    let intervalId;
    const fetchAssignment = async () => {
      try {
        const res = await deliveryAPI.getAssignmentByOrder(id);
        const a = res?.data;
        if (a) setAssignment(a);
        const s = a?.status;
        if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(s)) {
          clearInterval(intervalId);
        }
      } catch (_) {}
    };
    intervalId = setInterval(fetchAssignment, 5000);
    return () => intervalId && clearInterval(intervalId);
  }, [id, assignment]);

  // Retry creating assignment every 15s if none exists yet
  useEffect(() => {
    if (!id) return;
    let retryId;
    const tryCreate = async () => {
      if (assignment && assignment.id) return; // already created
      try {
        setIsAssigning(true);
        await deliveryAPI.createAssignment(id);
      } catch (_) {
        // Ignore errors like no available partners and keep retrying
      } finally {
        setIsAssigning(false);
      }
    };
    if (!assignment) tryCreate();
    retryId = setInterval(tryCreate, 15000);
    return () => retryId && clearInterval(retryId);
  }, [id, assignment]);

  if (!orderObj) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>Loading order…</Paper>
      </Container>
    );
  }

  // Build path from assignment coordinates; fallback to mock
  const path = assignment && assignment.pickupLatitude && assignment.deliveryLatitude
    ? [
        { lat: assignment.pickupLatitude, lng: assignment.pickupLongitude },
        { lat: assignment.currentLatitude || assignment.pickupLatitude, lng: assignment.currentLongitude || assignment.pickupLongitude },
        { lat: assignment.deliveryLatitude, lng: assignment.deliveryLongitude }
      ]
    : [
    { lat: 17.4065, lng: 78.4772 },
    { lat: 17.4100, lng: 78.4800 },
    { lat: 17.4150, lng: 78.4850 },
    { lat: 17.4200, lng: 78.4900 }
  ];

  const currentCenter = assignment && (assignment.currentLatitude != null && assignment.currentLongitude != null)
    ? { lat: assignment.currentLatitude, lng: assignment.currentLongitude }
    : path[0];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Track your order</Typography>
      <Paper sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
        <Stepper activeStep={stepIndex} alternativeLabel>
          {['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: '8px' }}>
        {!assignment && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 120 }}>
            <LoadingSpinner size={28} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Finding a delivery partner…</Typography>
              <Typography variant="body2" color="text.secondary">We’re looking for nearby partners. This may take a moment. We’ll update automatically.</Typography>
            </Box>
          </Box>
        )}

        {assignment && (
          <>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{assignment.status === 'ASSIGNED' ? 'Partner assigned' : 'Delivery Partner Location'}</Typography>
        <Box sx={{ height: 360, width: '100%', position: 'relative', overflow: 'hidden' }}>
          <DeliveryMap
                key={`${orderObj.id}-${stepIndex}-${assignment?.status || 'na'}-${assignment?.currentLatitude || 'x'}-${assignment?.currentLongitude || 'y'}`}
            path={path}
                initialCenter={currentCenter}
                currentPosition={assignment && assignment.currentLatitude != null && assignment.currentLongitude != null ? { lat: assignment.currentLatitude, lng: assignment.currentLongitude } : null}
                phase="to_customer"
                restaurantPosition={assignment && assignment.pickupLatitude != null && assignment.pickupLongitude != null ? { lat: assignment.pickupLatitude, lng: assignment.pickupLongitude } : null}
                customerPosition={assignment && assignment.deliveryLatitude != null && assignment.deliveryLongitude != null ? { lat: assignment.deliveryLatitude, lng: assignment.deliveryLongitude } : null}
                onReachedEnd={() => {}}
          />
        </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label={assignment.status} color={assignment.status === 'DELIVERED' ? 'success' : 'primary'} />
                {isAssigning && <Chip size="small" variant="outlined" label="Refreshing…" />}
              </Box>
          <Button variant="outlined" sx={{ textTransform: 'none' }} href={`tel:9999999999`}>Call Delivery Partner</Button>
        </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default OrderTrack;


