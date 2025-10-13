import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Paper, Typography, Box, Chip, Button, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import { deliveryAPI, orderAPI } from '../../services/api';
import DeliveryMap from '../../components/maps/DeliveryMap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RatingModal from '../../components/modals/RatingModal';

// Simple mock delivery partner location updates
const mockPath = [
  { lat: 17.4065, lng: 78.4772 },
  { lat: 17.4100, lng: 78.4800 },
  { lat: 17.4150, lng: 78.4850 },
  { lat: 17.4200, lng: 78.4900 }
];

const OrderTrack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const order = orders.find(o => String(o.id) === String(id));
  const [orderData, setOrderData] = useState(null);
  const orderObj = order || orderData;
  const [stepIndex, setStepIndex] = useState(0);
  const [assignment, setAssignment] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [deliveredOpen, setDeliveredOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({ restaurantReviewed: false, deliveryReviewed: false });
  const deliveredShownRef = useRef(false);

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

  // Open success modal exactly once when delivered
  useEffect(() => {
    const delivered = stepIndex === 3 || (assignment && assignment.status === 'DELIVERED') || ((orderObj?.status || orderObj?.orderStatus) === 'DELIVERED');
    if (delivered && !deliveredShownRef.current) {
      deliveredShownRef.current = true;
      setDeliveredOpen(true);
    }
  }, [stepIndex, assignment, orderObj]);

  // Check review status when order is delivered
  useEffect(() => {
    const delivered = stepIndex === 3 || (assignment && assignment.status === 'DELIVERED') || ((orderObj?.status || orderObj?.orderStatus) === 'DELIVERED');
    if (delivered && orderObj?.id) {
      console.log('OrderTrack: Fetching review status for order:', orderObj.id, 'delivered:', delivered, 'stepIndex:', stepIndex);
      orderAPI.getOrderReviewStatus(orderObj.id)
        .then(response => {
          console.log('OrderTrack: Review status response:', response.data);
          setReviewStatus(response.data);
        })
        .catch(error => {
          console.error('OrderTrack: Error fetching review status:', error);
        });
    }
  }, [stepIndex, assignment, orderObj]);

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
    if (!id) {
      console.log('OrderTrack: Not polling assignment - missing order id');
      return;
    }
    let intervalId;
    const fetchAssignment = async () => {
      try {
        console.log('OrderTrack: Polling assignment for order:', id);
        const res = await deliveryAPI.getAssignmentByOrder(id);
        const a = res?.data;
        if (a && a.id) {
          console.log('OrderTrack: Assignment update received:', a);
          setAssignment(a);
        }
        const s = a?.status;
        if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(s)) {
          console.log('OrderTrack: Terminal status reached, stopping polling:', s);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.log('OrderTrack: Assignment polling error:', error);
      }
    };
    console.log('OrderTrack: Starting assignment polling for order:', id);
    // Poll immediately once, then every 5s. This also recovers if previous GET returned 500.
    fetchAssignment();
    intervalId = setInterval(fetchAssignment, 5000);
    return () => {
      console.log('OrderTrack: Stopping assignment polling for order:', id);
      intervalId && clearInterval(intervalId);
    };
  }, [id]);

  // Retry creating assignment every 15s ONLY if payment is cleared or order is confirmed
  useEffect(() => {
    if (!id) return;
    let retryId;
    const tryCreate = async () => {
      if (assignment && assignment.id) {
        console.log('OrderTrack: Assignment already exists, skipping creation');
        return; // already created
      }
      const statusStr = (orderObj?.orderStatus || orderObj?.status || '').toUpperCase();
      const paymentStr = (orderObj?.paymentStatus || orderObj?.payment_state || '').toUpperCase();
      // Treat more payment success variants as cleared
      const isPaymentCleared = ['SUCCESS','PAID','COMPLETED','CAPTURED','SUCCEEDED'].includes(paymentStr);
      const isOrderConfirmed = ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(statusStr);
      
      console.log('OrderTrack: Auto-assignment check:', {
        orderId: id,
        statusStr,
        paymentStr,
        isPaymentCleared,
        isOrderConfirmed,
        hasAssignment: !!(assignment && assignment.id)
      });
      
      if (!isPaymentCleared && !isOrderConfirmed) {
        console.log('OrderTrack: Payment not cleared and order not confirmed, skipping assignment');
        return; // do not assign if payment failed/pending
      }
      
      console.log('OrderTrack: Attempting to create assignment for order:', id);
      try {
        setIsAssigning(true);
        const response = await deliveryAPI.createAssignment(id);
        console.log('OrderTrack: Assignment creation response:', response);
        // Immediately set assignment from response to stop further POST retries
        const created = response?.data || response;
        if (created && created.id) {
          setAssignment(created);
        } else {
          // Fallback: fetch assignment by order to hydrate full data
          try {
            const res = await deliveryAPI.getAssignmentByOrder(id);
            const a = res?.data;
            if (a && a.id) setAssignment(a);
          } catch (fetchErr) {
            console.log('OrderTrack: Failed to fetch assignment after create:', fetchErr);
          }
        }
      } catch (error) {
        console.log('OrderTrack: Assignment creation failed:', error);
        // If server reports already assigned, hydrate assignment once and stop retrying POST
        const msg = (error?.response?.data?.message || '').toString().toLowerCase();
        if (msg.includes('already assigned')) {
          try {
            const res = await deliveryAPI.getAssignmentByOrder(id);
            const a = res?.data;
            if (a && a.id) setAssignment(a);
          } catch (fetchErr) {
            console.log('OrderTrack: Failed to fetch assignment after already-assigned error:', fetchErr);
          }
        }
        // Ignore errors like no available partners and keep retrying
      } finally {
        setIsAssigning(false);
      }
    };
    if (!assignment) tryCreate();
    retryId = setInterval(tryCreate, 15000);
    return () => retryId && clearInterval(retryId);
  }, [id, assignment, orderObj]);

  if (!orderObj) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>Loading order…</Paper>
      </Container>
    );
  }

  // Check payment status - show message if payment is not completed
  const paymentStatus = (orderObj.paymentStatus || orderObj.payment_state || '').toUpperCase();
  const isPaymentCompleted = paymentStatus === 'COMPLETED' || paymentStatus === 'PAID' || paymentStatus === 'SUCCESS';
  
  if (!isPaymentCompleted) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#fc8019' }}>
            Payment Pending
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
            Order tracking is only available after payment is completed.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#999' }}>
            Current payment status: {paymentStatus || 'PENDING'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()} 
            sx={{ 
              textTransform: 'none', 
              backgroundColor: '#fc8019', 
              '&:hover': { backgroundColor: '#e6730a' } 
            }}
          >
            Go Back
          </Button>
        </Paper>
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
      <Paper sx={{ p: 2, borderRadius: '3px', mb: 2 }}>
        <Stepper activeStep={stepIndex} alternativeLabel>
          {['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: '3px' }}>
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

      {/* Delivered success modal */}
      <Dialog open={deliveredOpen} onClose={() => setDeliveredOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              margin: '0 auto',
              boxShadow: '0 8px 20px rgba(46,125,50,0.18)'
            }}>
              <CheckCircleIcon fontSize="inherit" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 2, mb: 0.5, letterSpacing: 0.2 }}>Delivered Successfully</Typography>
            <Typography variant="body2" color="text.secondary">Order #{id} has been delivered. Hope you enjoyed your meal!</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => setDeliveredOpen(false)} 
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
            {(!reviewStatus.restaurantReviewed || !reviewStatus.deliveryReviewed) && (
              <Button 
                fullWidth
                variant="contained" 
                onClick={() => {
                  setDeliveredOpen(false);
                  setRatingModalOpen(true);
                }} 
                sx={{ 
                  textTransform: 'none', 
                  backgroundColor: '#fc8019', 
                  '&:hover': { backgroundColor: '#e6730a' } 
                }}
              >
                {!reviewStatus.restaurantReviewed && !reviewStatus.deliveryReviewed ? 'Rate Order' : 'Complete Rating'}
              </Button>
            )}
            <Button 
              fullWidth
              variant="contained" 
              onClick={() => navigate('/')} 
              sx={{ 
                textTransform: 'none', 
                backgroundColor: '#4caf50', 
                '&:hover': { backgroundColor: '#45a049' } 
              }}
            >
              Go to Home
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <RatingModal
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        order={orderObj}
        assignment={assignment}
        onReviewSubmitted={() => {
          // Refresh review status after submission
          if (orderObj?.id) {
            orderAPI.getOrderReviewStatus(orderObj.id)
              .then(response => {
                setReviewStatus(response.data);
              })
              .catch(error => {
                console.error('Error fetching review status:', error);
              });
          }
        }}
      />
    </Container>
  );
};

export default OrderTrack;


