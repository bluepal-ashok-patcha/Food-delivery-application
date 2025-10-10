import React, { useMemo, useState, useEffect } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, Typography, Stack, Button, Chip } from '@mui/material';

import { LocalShipping, AttachMoney, Star, CheckCircle, Phone, Restaurant, Navigation, Analytics, TrendingUp, Schedule, LocationOn } from '@mui/icons-material';

import { mockOrders, mockDeliveryPartners, mockRestaurants, mockUsers } from '../../constants/mockData';

import DeliveryHeader from '../../components/delivery/DeliveryHeader';

import EnhancedStatCard from '../../components/admin/EnhancedStatCard';

import TabHeader from '../../components/admin/TabHeader';

import AvailableOrdersCard from '../../components/delivery/AvailableOrdersCard';

import MyOrdersTable from '../../components/delivery/MyOrdersTable';

import EarningsCard from '../../components/delivery/EarningsCard';

import Modal from '../../components/common/Modal';

import TextField from '../../components/common/TextField';

import DeliveryMap from '../../components/maps/DeliveryMap';

import { deliveryAPI, orderAPI } from '../../services/api';


const DeliveryDashboard = () => {

  const [tabValue, setTabValue] = useState(0);

  const [isOnline, setIsOnline] = useState(true);

  // Assignments fetched from backend; fallback to mock-shaped orders when API is unavailable
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [partners, setPartners] = useState(() => [...mockDeliveryPartners]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showOrderModal, setShowOrderModal] = useState(false);

  const [mapReady, setMapReady] = useState(false);

  const [showFullMap, setShowFullMap] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profileDraft, setProfileDraft] = useState(() => ({

    name: partners[0]?.name || '',

    phone: partners[0]?.phone || '',

    vehicleType: partners[0]?.vehicleType || 'Bike',

    vehicleNumber: partners[0]?.vehicleNumber || ''

  }));

  // Analytics and profile state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');


  // Map between UI statuses and backend DeliveryStatus enums
  const DeliveryStatusEnum = {
    // 'assigned' is a UI-only state; we won't send ASSIGNED as an update
    assigned: 'ASSIGNED',
    accepted: 'ACCEPTED',
    heading_to_pickup: 'HEADING_TO_PICKUP',
    arrived_at_pickup: 'ARRIVED_AT_PICKUP',
    picked_up: 'PICKED_UP',
    heading_to_delivery: 'HEADING_TO_DELIVERY',
    arrived_at_delivery: 'ARRIVED_AT_DELIVERY',
    delivered: 'DELIVERED'
  };

  // Map delivery status transitions to order status updates
  const OrderStatusForDelivery = {
    accepted: null, // order remains READY_FOR_PICKUP
    picked_up: 'OUT_FOR_DELIVERY',
    heading_to_delivery: null, // no change
    delivered: 'DELIVERED'
  };

  const toUiStatus = (backendStatus) => {
    switch (backendStatus) {
      case 'ACCEPTED': return 'accepted';
      case 'HEADING_TO_PICKUP': return 'heading_to_pickup';
      case 'ARRIVED_AT_PICKUP': return 'arrived_at_pickup';
      case 'PICKED_UP': return 'picked_up';
      case 'HEADING_TO_DELIVERY': return 'heading_to_delivery';
      case 'ARRIVED_AT_DELIVERY': return 'arrived_at_delivery';
      case 'DELIVERED': return 'delivered';
      case 'ASSIGNED': return 'assigned';
      default: return String(backendStatus || '').toLowerCase();
    }
  };

  const nextUiStatus = (uiStatus) => {
    switch (uiStatus) {
      case 'assigned': return 'accepted';
      case 'accepted': return 'heading_to_pickup';
      case 'heading_to_pickup': return 'arrived_at_pickup';
      case 'arrived_at_pickup': return 'picked_up';
      case 'picked_up': return 'heading_to_delivery';
      case 'heading_to_delivery': return 'arrived_at_delivery';
      case 'arrived_at_delivery': return 'delivered';
      default: return null;
    }
  };

  // Initial load: fetch my active assignments as working set
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [activeRes, availableRes] = await Promise.all([
          deliveryAPI.getActiveAssignments(),
          deliveryAPI.getAvailableOrders()
        ]);
        const data = activeRes?.data || [];
        const available = availableRes?.data || [];
        if (!isMounted) return;
        // Normalize to current UI shape
        const normalized = data.map((a) => ({
          id: a.orderId || a.id,
          orderId: a.orderId || a.id,
          assignmentId: a.id, // This is the assignment ID needed for acceptAssignment
          customerId: a.customerId,
          restaurantId: a.restaurantId,
          deliveryPartnerId: a.deliveryPartnerId,
          status: toUiStatus(a.status),
          deliveryAddress: a.deliveryAddress,
          pickupLatitude: a.pickupLatitude,
          pickupLongitude: a.pickupLongitude,
          deliveryLatitude: a.deliveryLatitude,
          deliveryLongitude: a.deliveryLongitude,
          currentLatitude: a.currentLatitude,
          currentLongitude: a.currentLongitude,
          // optional fields for UI compatibility
          subtotal: a.subtotal || 0,
          deliveryFee: a.deliveryFee || 0,
          tax: a.tax || 0,
          total: a.total || 0,
          orderDate: a.assignedAt || new Date().toISOString(),
        }));
        const normalizedAvailable = available.map((o) => ({
          id: o.orderId,
          orderId: o.orderId,
          customerId: o.customerId,
          restaurantId: o.restaurantId,
          restaurantName: o.restaurantName,
          restaurantAddress: o.restaurantAddress,
          deliveryAddress: o.deliveryAddress,
          pickupLatitude: o.pickupLatitude,
          pickupLongitude: o.pickupLongitude,
          deliveryLatitude: o.deliveryLatitude,
          deliveryLongitude: o.deliveryLongitude,
          status: 'ready_for_pickup',
          deliveryFee: o.deliveryFee || 0,
          total: o.totalAmount || 0
        }));
        setAvailableOrders(normalizedAvailable);
        setActiveOrders(normalized);
        const merged = [...normalizedAvailable, ...normalized];
        setOrders(merged);
      } catch (_) {
        // keep mock fallback silently
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Periodically send partner geolocation to backend
  const [partnerPosition, setPartnerPosition] = useState(null);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords || {};
          if (latitude && longitude) {
            deliveryAPI.updateLocation(latitude, longitude).catch(() => {});
            setPartnerPosition({ lat: latitude, lng: longitude });
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
    return () => { if (navigator.geolocation && watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await deliveryAPI.getProfile();
        setProfile(response.data);
        setProfileDraft({
          name: response.data.name || '',
          phone: response.data.phoneNumber || '',
          vehicleType: 'Bike',
          vehicleNumber: response.data.vehicleDetails || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Load analytics data
  const loadAnalytics = async (period = 'week') => {
    setAnalyticsLoading(true);
    try {
      const response = await deliveryAPI.getAnalytics(period);
      setAnalytics(response);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set fallback analytics data
      setAnalytics({
        totalDeliveries: myOrders.length,
        completedDeliveries: completedOrders.length,
        todayEarnings: 0,
        totalEarnings: 0,
        averageRating: 4.8,
        completionRate: 95.0,
        averageDeliveryTime: 25
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load analytics on component mount
  useEffect(() => {
    loadAnalytics('week');
  }, []);

  // Update partner status
  const updatePartnerStatus = async (status) => {
    try {
      await deliveryAPI.updateStatus(status);
      setIsOnline(status === 'AVAILABLE');
      // Refresh profile to get updated status
      const response = await deliveryAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      const profileData = {
        name: profileDraft.name,
        phoneNumber: profileDraft.phone,
        vehicleDetails: profileDraft.vehicleNumber
      };
      const response = await deliveryAPI.updateProfile(profileData);
      setProfile(response.data);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => {

    setTabValue(newValue);

  };



  const handleToggleStatus = () => {
    const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';
    updatePartnerStatus(newStatus);
  };



  // Available and active come from backend-normalized state
  const myOrders = useMemo(() => activeOrders.filter(order => order.status !== 'delivered'), [activeOrders]);
  const completedOrders = myOrders.filter(order => order.status === 'delivered');



  const stats = [

    { 

      title: 'Available Orders', 

      value: availableOrders.length, 

      icon: <LocalShipping />, 

      color: '#fc8019',

      change: '+5%',

      trend: 'up',

      subtitle: 'Ready for pickup'

    },

    { 

      title: 'My Orders', 

      value: myOrders.length, 

      icon: <CheckCircle />, 

      color: '#fc8019',

      change: '+12%',

      trend: 'up',

      subtitle: 'Active deliveries'

    },

    { 

      title: 'Total Earnings', 

      value: analytics?.totalEarnings ? `₹${analytics.totalEarnings}` : '₹0.00', 

      icon: <AttachMoney />, 

      color: '#fc8019',

      change: '+8%',

      trend: 'up',

      subtitle: 'Total earned'

    },

    { 

      title: 'Avg. Rating', 

      value: analytics?.averageRating ? analytics.averageRating.toFixed(1) : '4.8', 

      icon: <Star />, 

      color: '#fc8019',

      change: '+0.2',

      trend: 'up',

      subtitle: 'Customer rating'

    },

    { 

      title: 'Total Deliveries', 

      value: analytics?.totalDeliveries || 0, 

      icon: <CheckCircle />, 

      color: '#4caf50',

      change: '+12%',

      trend: 'up',

      subtitle: 'Completed deliveries'

    },

  ];



  const handleAcceptOrder = async (orderId) => {
    try {
      // For auto-assigned orders (status: assigned), use acceptAssignment
      const inMyOrders = activeOrders.find(o => (o.id === orderId || o.orderId === orderId));
      if (inMyOrders && inMyOrders.assignmentId) {
        // This is an auto-assigned order, accept it first
        await deliveryAPI.acceptAssignment(inMyOrders.assignmentId);
      } else {
        // This is an available order, claim it
        await deliveryAPI.claimOrder(orderId);
      }
      // Refresh lists after accept
      const [activeRes, availableRes] = await Promise.all([
        deliveryAPI.getActiveAssignments(),
        deliveryAPI.getAvailableOrders()
      ]);
      const updatedActive = (activeRes?.data || []).map((a) => ({
        id: a.orderId || a.id,
        orderId: a.orderId || a.id,
        assignmentId: a.id, // This is the assignment ID needed for acceptAssignment
        customerId: a.customerId,
        customerName: a.customerName || a.customerFullName || a.userName || `Customer #${a.customerId}`,
        restaurantId: a.restaurantId,
        restaurantName: a.restaurantName || a.restaurantTitle || `Restaurant #${a.restaurantId}`,
        deliveryPartnerId: a.deliveryPartnerId,
        status: toUiStatus(a.status),
        deliveryAddress: a.deliveryAddress || a.customerAddress || a.dropAddress || 'Delivery address not available',
        restaurantAddress: a.pickupAddress || a.restaurantAddress || 'Pickup address not available',
        pickupLatitude: a.pickupLatitude,
        pickupLongitude: a.pickupLongitude,
        deliveryLatitude: a.deliveryLatitude,
        deliveryLongitude: a.deliveryLongitude,
        currentLatitude: a.currentLatitude,
        currentLongitude: a.currentLongitude,
        deliveryFee: a.deliveryFee || 0,
        total: a.total || 0,
        orderDate: a.assignedAt || new Date().toISOString(),
      }));
      const updatedAvailable = (availableRes?.data || []).map((o) => ({
        id: o.orderId,
        orderId: o.orderId,
        customerId: o.customerId,
        restaurantId: o.restaurantId,
        restaurantName: o.restaurantName,
        restaurantAddress: o.restaurantAddress,
        deliveryAddress: o.deliveryAddress,
        pickupLatitude: o.pickupLatitude,
        pickupLongitude: o.pickupLongitude,
        deliveryLatitude: o.deliveryLatitude,
        deliveryLongitude: o.deliveryLongitude,
        status: 'ready_for_pickup',
        deliveryFee: o.deliveryFee || 0,
        total: o.totalAmount || 0
      }));
      setAvailableOrders(updatedAvailable);
      setActiveOrders(updatedActive);
      const justAccepted = updatedActive.find(o => (o.id === orderId || o.orderId === orderId)) || null;
      if (justAccepted) openOrderDetails({ ...justAccepted, status: 'accepted' });
    } catch (_) {
      // fallback: optimistic UI
      setActiveOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status: 'accepted' } : o));
    }

  };



  const handleRejectOrder = (orderId) => {

    // put back to available; no change needed as available list is derived

  };



  const openOrderDetails = (order) => {

    setSelectedOrder(order);

    setShowOrderModal(true);

    // Set map ready after a short delay to ensure modal is fully rendered

    setTimeout(() => setMapReady(true), 100);

  };



  // Reset map ready when modal closes

  React.useEffect(() => {

    if (!showOrderModal) {

      setMapReady(false);

    }

  }, [showOrderModal]);



  const updateDeliveryStatus = async (orderId, status) => {
    const backendStatus = DeliveryStatusEnum[status] || status;
    try {
      // fetch assignment for this order
      const res = await deliveryAPI.getAssignmentByOrder(orderId);
      const assignment = res?.data;
      if (assignment?.id) {
        if (status === 'accepted') {
          // First accept the assignment (transition ASSIGNED -> ACCEPTED)
          await deliveryAPI.acceptAssignment(assignment.id);
        } else if (status !== 'assigned') {
          await deliveryAPI.updateDeliveryStatus(assignment.id, backendStatus);
        }
      }
      // Update order status if required
      const orderStatus = OrderStatusForDelivery[status];
      if (orderStatus) {
        await orderAPI.updateOrderStatus(orderId, orderStatus);
      }
    } catch (_) {
      // ignore errors, still reflect on UI optimistically
    }
    setActiveOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status } : o));
  };



  const handleCompleteOrder = (orderId, status = 'delivered') => {

    updateDeliveryStatus(orderId, status);

  };



  return (

    <Box sx={{ 

      background: '#f5f5f5',

      minHeight: '100vh',

      py: 3

    }}>

      <Container maxWidth="xl">

        <DeliveryHeader isOnline={isOnline} onToggleStatus={handleToggleStatus} onEditProfile={() => setShowProfileModal(true)} />



        <Grid container spacing={2} sx={{ mb: 3 }}>

          {stats.map((stat, index) => (

            <Grid item xs={12} md={4} key={index}>

              <EnhancedStatCard stat={stat} />

            </Grid>

          ))}

        </Grid>



        <Paper sx={{ 

          mb: 3,

          borderRadius: '4px',

          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',

          overflow: 'hidden'

        }}>

          <Tabs 

            value={tabValue} 

            onChange={handleTabChange}

            sx={{

              '& .MuiTab-root': {

                textTransform: 'none',

                fontWeight: 600,

                fontSize: '16px',

                minHeight: '64px',

                '&.Mui-selected': {

                  color: '#fc8019'

                }

              },

              '& .MuiTabs-indicator': {

                height: '4px',

                background: '#fc8019'

              }

            }}

          >

            <Tab label="Available Orders" />

            <Tab label="My Orders" />

            <Tab label="Analytics" />

          </Tabs>

        </Paper>



        <Paper sx={{ 

          borderRadius: '4px',

          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',

          overflow: 'hidden'

        }}>

          {tabValue === 0 && (

            <Box sx={{ p: 4 }}>

              <TabHeader 

                title="Available Orders" 

                subtitle="Accept new delivery opportunities"

                showAddButton={false}

              />

              
              
              {availableOrders.length === 0 ? (

                <Box sx={{ textAlign: 'center', py: 6 }}>

                  <LocalShipping sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />

                  <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>

                    No available orders

                  </Typography>

                  <Typography variant="body2" sx={{ color: '#999' }}>

                    Check back later for new delivery opportunities

                  </Typography>

                </Box>

              ) : (

                <Grid container spacing={3}>

                  {availableOrders.map((order) => (

                    <Grid item xs={12} md={6} key={order.id}>

                      <AvailableOrdersCard order={order} onAcceptOrder={handleAcceptOrder} />

                    </Grid>

                  ))}

                </Grid>

              )}

            </Box>

          )}



          {tabValue === 1 && (

            <Box sx={{ p: 4 }}>

              <TabHeader 

                title="My Orders" 

                subtitle="Manage your active and completed deliveries"

                showAddButton={false}

              />

              <MyOrdersTable orders={myOrders} onCompleteOrder={handleCompleteOrder} onRowClick={openOrderDetails} onAcceptOrder={handleAcceptOrder} />

            </Box>

          )}



          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Analytics & Performance" 
                subtitle="Track your delivery performance and earnings"
                showAddButton={false}
              />
              
              {analyticsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <LinearProgress sx={{ width: '200px' }} />
                </Box>
              ) : (
              <Grid container spacing={3}>
                  {/* Key Metrics Row */}
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ 
                          p: 3, 
                          borderRadius: '8px', 
                          border: '1px solid #e0e0e0',
                          textAlign: 'center',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                            {analytics?.totalDeliveries || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Total Deliveries
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ 
                          p: 3, 
                          borderRadius: '8px', 
                          border: '1px solid #e0e0e0',
                          textAlign: 'center',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                            {analytics?.completionRate ? `${analytics.completionRate.toFixed(0)}%` : '0%'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Completion Rate
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ 
                          p: 3, 
                          borderRadius: '8px', 
                          border: '1px solid #e0e0e0',
                          textAlign: 'center',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                            {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '0.0'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Average Rating
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ 
                          p: 3, 
                          borderRadius: '8px', 
                          border: '1px solid #e0e0e0',
                          textAlign: 'center',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                            {analytics?.averageDeliveryTime ? `${analytics.averageDeliveryTime.toFixed(0)}m` : '0m'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Avg. Delivery Time
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Earnings Section */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                        Earnings Overview
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                              ₹{analytics?.totalEarnings || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Total Earnings
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                              ₹{analytics?.todayEarnings || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Today's Earnings
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                              ₹{analytics?.averageEarningsPerDelivery || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Avg. per Delivery
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  {/* Detailed Stats */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                        Delivery Statistics
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Completed Deliveries</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {analytics?.completedDeliveries || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Cancelled Deliveries</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {analytics?.cancelledDeliveries || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>On-time Rate</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {analytics?.onTimeDeliveryRate ? `${analytics.onTimeDeliveryRate.toFixed(0)}%` : '0%'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                        Performance Metrics
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Total Reviews</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {analytics?.totalReviews || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Cancellation Rate</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {analytics?.cancellationRate ? `${analytics.cancellationRate.toFixed(1)}%` : '0%'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>Active Deliveries</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {analytics?.activeDeliveries || 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                </Grid>
              </Grid>
              )}
            </Box>
          )}

        </Paper>

        {/* Order details modal */}

        <Modal

          open={showOrderModal}

          onClose={() => setShowOrderModal(false)}

          title={selectedOrder ? `Delivery Order #${selectedOrder.id}` : 'Delivery Order'}

          maxWidth="md"

          fullWidth

          actions={
            <Stack direction="row" spacing={1}>
              {(() => {
                const s = selectedOrder?.status;
                const next = nextUiStatus(s);
                if (!next) return null;
                const labels = {
                  accepted: 'Head to Pickup',
                  heading_to_pickup: 'Head to Pickup',
                  arrived_at_pickup: 'Arrived at Pickup',
                  picked_up: 'Picked Up',
                  heading_to_delivery: 'Head to Delivery',
                  arrived_at_delivery: 'Arrived at Delivery',
                  delivered: 'Delivered'
                };
                const colors = {
                  accepted: '#2196f3',
                  heading_to_pickup: '#2196f3',
                  arrived_at_pickup: '#1976d2',
                  picked_up: '#1976d2',
                  heading_to_delivery: '#fc8019',
                  arrived_at_delivery: '#ff9800',
                  delivered: '#4caf50'
                };
                return (
                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, next); setShowOrderModal(false); }} sx={{ background: colors[next] }}>{labels[next]}</Button>
                );
              })()}
              <Button variant="outlined" onClick={() => setShowFullMap(true)}>Full Map</Button>
              <Button onClick={() => setShowOrderModal(false)}>Close</Button>
            </Stack>
          }

        >

          {selectedOrder && (

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Map Section */}

              <Box sx={{

                width: '100%',

                borderRadius: '8px',

                overflow: 'hidden',

                border: '1px solid #e0e0e0',

                position: 'relative',

                background: '#f5f5f5',

                display: 'flex',

                alignItems: 'stretch',

                justifyContent: 'center',

                minHeight: '400px',

                maxHeight: '400px',

                height: '400px',

              }}>

                <Box sx={{ width: '100%', height: '400px', minHeight: '400px', maxHeight: '400px' }}>

                  {(() => {
                    const restaurantLoc = (selectedOrder.pickupLatitude && selectedOrder.pickupLongitude)
                      ? { lat: selectedOrder.pickupLatitude, lng: selectedOrder.pickupLongitude }
                      : { lat: 19.076, lng: 72.8777 };
                    const customerLoc = (selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude)
                      ? { lat: selectedOrder.deliveryLatitude, lng: selectedOrder.deliveryLongitude }
                      : { lat: restaurantLoc.lat + 0.1, lng: restaurantLoc.lng + 0.1 };
                    const goingToRestaurant = ['accepted','heading_to_pickup','arrived_at_pickup'].includes(selectedOrder.status);
                    const path = goingToRestaurant
                      ? [partnerPosition || restaurantLoc, restaurantLoc]
                      : [restaurantLoc, customerLoc];
                    const center = goingToRestaurant ? (partnerPosition || restaurantLoc) : restaurantLoc;
                    const phase = goingToRestaurant ? 'to_restaurant' : 'to_customer';
                    const mapKey = `${showOrderModal}-${selectedOrder.id}`;
                    return (
                      <DeliveryMap
                        key={mapKey}
                        path={path}
                        initialCenter={center}
                        forceResize={showOrderModal}
                        phase={phase}
                        restaurantPosition={{ lat: restaurantLoc.lat, lng: restaurantLoc.lng }}
                        customerPosition={{ lat: customerLoc.lat, lng: customerLoc.lng }}
                        currentPosition={partnerPosition || undefined}
                      />
                    );
                  })()}

                </Box>

              </Box>

              
              
              {/* Details Section */}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Order Details</Typography>

                <Chip label={selectedOrder.status.replace('_',' ')} sx={{ alignSelf: 'flex-start' }} />
                {selectedOrder.status === 'accepted' && (
                  <Typography variant="body2" sx={{ color: '#2196f3' }}>
                    Accepted. Proceed towards the restaurant for pickup.
                  </Typography>
                )}

                <Typography variant="body2">Customer #{selectedOrder.customerId}</Typography>

                <Typography variant="body2">Restaurant #{selectedOrder.restaurantId}</Typography>

                <Typography variant="body2">Destination: {selectedOrder.deliveryAddress}</Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>

                  {(() => {

                    const customer = mockUsers.find(u => u.id === selectedOrder.customerId);

                    const restaurant = mockRestaurants.find(r => r.id === selectedOrder.restaurantId);

                    const customerPhone = customer?.phone || '+91-9876543210';

                    const restaurantPhone = restaurant?.phone || '+91-9876543211';

                    // Get coordinates for navigation
                    const restaurantLat = selectedOrder.pickupLatitude || 19.076;
                    const restaurantLng = selectedOrder.pickupLongitude || 72.8777;
                    const customerLat = selectedOrder.deliveryLatitude || restaurantLat + 0.01;
                    const customerLng = selectedOrder.deliveryLongitude || restaurantLng + 0.01;

                    // Determine navigation target based on order status
                    const goingToRestaurant = ['accepted','heading_to_pickup','arrived_at_pickup'].includes(selectedOrder.status);
                    const navLat = goingToRestaurant ? restaurantLat : customerLat;
                    const navLng = goingToRestaurant ? restaurantLng : customerLng;
                    const navLabel = goingToRestaurant ? 'Restaurant' : 'Customer';

                    return <>

                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<Phone />} 
                        onClick={() => window.open(`tel:${customerPhone}`)}
                        sx={{
                          borderColor: '#FC8019',
                          color: '#FC8019',
                          '&:hover': {
                            borderColor: '#E6730A',
                            backgroundColor: '#FFF5F0'
                          }
                        }}
                      >
                        Call Customer
                      </Button>

                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<Restaurant />} 
                        onClick={() => window.open(`tel:${restaurantPhone}`)}
                        sx={{
                          borderColor: '#FC8019',
                          color: '#FC8019',
                          '&:hover': {
                            borderColor: '#E6730A',
                            backgroundColor: '#FFF5F0'
                          }
                        }}
                      >
                        Call Restaurant
                      </Button>

                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<Navigation />}
                        onClick={() => {
                          // Open Google Maps with navigation
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${navLat},${navLng}`;
                          window.open(url, '_blank');
                        }}
                        sx={{
                          borderColor: '#FC8019',
                          color: '#FC8019',
                          '&:hover': {
                            borderColor: '#E6730A',
                            backgroundColor: '#FFF5F0'
                          }
                        }}
                      >
                        Navigate to {navLabel}
                      </Button>

                    </>;

                  })()}

                </Stack>

              </Box>

            </Box>

          )}

        </Modal>



        {/* Fullscreen Map for swiggy-like wide experience */}

        <Modal

          open={showFullMap}

          onClose={() => setShowFullMap(false)}

          title={null}

          fullScreen

        >

          {selectedOrder && (

            <Box sx={{ position: 'relative', height: '100vh', width: '100vw', p: 0, m: 0 }}>

              <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 1, flexWrap: 'wrap' }}>

                <Button variant="contained" onClick={() => setShowFullMap(false)} sx={{ background: '#FC8019' }}>Close</Button>

                {/* Navigation and Call buttons */}
                {(() => {
                  const customer = mockUsers.find(u => u.id === selectedOrder.customerId);
                  const restaurant = mockRestaurants.find(r => r.id === selectedOrder.restaurantId);
                  const customerPhone = customer?.phone || '+91-9876543210';
                  const restaurantPhone = restaurant?.phone || '+91-9876543211';

                  // Get coordinates for navigation
                  const restaurantLat = selectedOrder.pickupLatitude || 19.076;
                  const restaurantLng = selectedOrder.pickupLongitude || 72.8777;
                  const customerLat = selectedOrder.deliveryLatitude || restaurantLat + 0.01;
                  const customerLng = selectedOrder.deliveryLongitude || restaurantLng + 0.01;

                  // Determine navigation target based on order status
                  const goingToRestaurant = ['accepted','heading_to_pickup','arrived_at_pickup'].includes(selectedOrder.status);
                  const navLat = goingToRestaurant ? restaurantLat : customerLat;
                  const navLng = goingToRestaurant ? restaurantLng : customerLng;
                  const navLabel = goingToRestaurant ? 'Restaurant' : 'Customer';

                  return (
                    <>
                      <Button 
                        variant="outlined" 
                        startIcon={<Phone />} 
                        onClick={() => window.open(`tel:${customerPhone}`)}
                        sx={{ 
                          borderColor: '#FC8019', 
                          color: '#FC8019',
                          '&:hover': {
                            borderColor: '#E6730A',
                            backgroundColor: '#FFF5F0'
                          }
                        }}
                      >
                        Call Customer
                      </Button>

                      <Button 
                        variant="outlined" 
                        startIcon={<Restaurant />} 
                        onClick={() => window.open(`tel:${restaurantPhone}`)}
                        sx={{ 
                          borderColor: '#FC8019', 
                          color: '#FC8019',
                          '&:hover': {
                            borderColor: '#E6730A',
                            backgroundColor: '#FFF5F0'
                          }
                        }}
                      >
                        Call Restaurant
                      </Button>

                      <Button 
                        variant="outlined" 
                        startIcon={<Navigation />}
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${navLat},${navLng}`;
                          window.open(url, '_blank');
                        }}
                        sx={{ 
                          borderColor: '#FC8019', 
                          color: '#FC8019',
                          '&:hover': {
                            borderColor: '#E6730A',
                            backgroundColor: '#FFF5F0'
                          }
                        }}
                      >
                        Navigate to {navLabel}
                      </Button>
                    </>
                  );
                })()}

                {/* Status update buttons */}
                {selectedOrder.status === 'accepted' && (

                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'picked_up'); setShowFullMap(false); }} sx={{ background: '#FC8019' }}>Picked Up</Button>

                )}

                {selectedOrder.status === 'picked_up' && (

                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'heading_to_delivery'); setShowFullMap(false); }} sx={{ background: '#FC8019' }}>On the Way</Button>

                )}

                {selectedOrder.status === 'heading_to_delivery' && (

                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'arrived_at_delivery'); setShowFullMap(false); }} sx={{ background: '#FC8019' }}>Arrived at Delivery</Button>

                )}

                {selectedOrder.status === 'arrived_at_delivery' && (

                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'delivered'); setShowFullMap(false); }} sx={{ background: '#4CAF50' }}>Delivered</Button>

                )}

              </Box>

              {(() => {

                const activePartner = partners.find(p => p.id === 4) || partners[0];

                const partnerLoc = activePartner?.currentLocation || { lat: 18.5204, lng: 73.8567 };

                const restaurant = mockRestaurants.find(r => r.id === selectedOrder.restaurantId);

                const restaurantLoc = restaurant?.location ? { lat: restaurant.location.latitude, lng: restaurant.location.longitude } : { lat: 19.076, lng: 72.8777 };

                const customerLoc = selectedOrder.customerLocation || { lat: (restaurantLoc.lat || 18.52) + 0.12, lng: (restaurantLoc.lng || 73.85) + 0.12 };

                const path = selectedOrder.status === 'accepted' ? [partnerLoc, restaurantLoc] : [restaurantLoc, customerLoc];

                const center = selectedOrder.status === 'accepted' ? partnerLoc : restaurantLoc;

                return (

                  <Box sx={{ height: '100%', width: '100%' }}>

                    <DeliveryMap path={path} initialCenter={center} forceResize={showFullMap} />

                  </Box>

                );

              })()}

            </Box>

          )}

        </Modal>



        {/* Profile modal */}

        <Modal

          open={showProfileModal}

          onClose={() => setShowProfileModal(false)}

          title="Edit Delivery Profile"

          maxWidth="sm"

          fullWidth

          actions={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setShowProfileModal(false)}>Cancel</Button>
              <Button variant="contained" onClick={updateProfile} sx={{ background: '#fc8019' }}>Save</Button>
            </Stack>
          }

        >

          <Stack spacing={2}>

            <TextField label="Name" fullWidth value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} />

            <TextField label="Phone" fullWidth value={profileDraft.phone} onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })} />

            <TextField label="Vehicle Type" fullWidth value={profileDraft.vehicleType} onChange={(e) => setProfileDraft({ ...profileDraft, vehicleType: e.target.value })} />

            <TextField label="Vehicle Number" fullWidth value={profileDraft.vehicleNumber} onChange={(e) => setProfileDraft({ ...profileDraft, vehicleNumber: e.target.value })} />

          </Stack>

        </Modal>



      </Container>

    </Box>

  );

};



export default DeliveryDashboard;


