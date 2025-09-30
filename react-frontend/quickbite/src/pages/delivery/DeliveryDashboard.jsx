import React, { useMemo, useState } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, Typography, Stack, Button, Chip } from '@mui/material';
import { LocalShipping, AttachMoney, Star, CheckCircle, Phone, Restaurant, Navigation } from '@mui/icons-material';
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

const DeliveryDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState(() => [
    ...mockOrders,
    // Extra mock orders for delivery testing
    {
      id: 1011,
      customerId: 1,
      restaurantId: 1,
      deliveryPartnerId: null,
      status: 'ready_for_pickup',
      items: [
        { id: 101, name: 'Chicken Tikka', quantity: 1, price: 12.99 }
      ],
      subtotal: 12.99,
      deliveryFee: 2.99,
      tax: 1.17,
      total: 17.15,
      deliveryAddress: '221B Baker Street, London',
      paymentMethod: 'cod',
      orderDate: new Date().toISOString()
    },
    {
      id: 1012,
      customerId: 1,
      restaurantId: 2,
      deliveryPartnerId: 4,
      status: 'picked_up',
      items: [
        { id: 301, name: 'Margherita Pizza', quantity: 1, price: 14.99 }
      ],
      subtotal: 14.99,
      deliveryFee: 1.99,
      tax: 1.36,
      total: 18.34,
      deliveryAddress: '10 Downing Street, London',
      paymentMethod: 'card',
      orderDate: new Date().toISOString()
    },
    {
      id: 1013,
      customerId: 1,
      restaurantId: 3,
      deliveryPartnerId: 4,
      status: 'out_for_delivery',
      items: [
        { id: 401, name: 'California Roll', quantity: 2, price: 8.99 }
      ],
      subtotal: 17.98,
      deliveryFee: 3.49,
      tax: 1.87,
      total: 23.34,
      deliveryAddress: '1600 Pennsylvania Ave NW, Washington, DC',
      paymentMethod: 'card',
      orderDate: new Date().toISOString()
    }
  ]);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleStatus = () => {
    setIsOnline(!isOnline);
  };

  const availableOrders = useMemo(() => orders.filter(order => order.status === 'ready_for_pickup' && (order.deliveryPartnerId == null)), [orders]);
  const myOrders = useMemo(() => orders.filter(order => order.deliveryPartnerId === 4 && order.status !== 'delivered'), [orders]);
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
      title: 'Today\'s Earnings', 
      value: '$45.50', 
      icon: <AttachMoney />, 
      color: '#fc8019',
      change: '+8%',
      trend: 'up',
      subtitle: 'Total earned'
    },
    { 
      title: 'Avg. Rating', 
      value: '4.8', 
      icon: <Star />, 
      color: '#fc8019',
      change: '+0.2',
      trend: 'up',
      subtitle: 'Customer rating'
    },
  ];

  const handleAcceptOrder = (orderId) => {
    // On accept, navigate to restaurant first
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryPartnerId: 4, status: 'accepted' } : o));
    const justAccepted = orders.find(o => o.id === orderId);
    if (justAccepted) {
      openOrderDetails({ ...justAccepted, status: 'accepted' });
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

  const updateDeliveryStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleCompleteOrder = (orderId) => {
    updateDeliveryStatus(orderId, 'delivered');
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
            <Tab label="Earnings" />
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
              <MyOrdersTable orders={myOrders} onCompleteOrder={handleCompleteOrder} onRowClick={openOrderDetails} />
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Earnings & Performance" 
                subtitle="Track your delivery performance and earnings"
                showAddButton={false}
              />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <EarningsCard 
                    title="Today's Summary"
                    data={[
                      { label: 'Completed Deliveries', value: completedOrders.length },
                      { label: 'Total Earnings', value: '$45.50' },
                      { label: 'Average per Delivery', value: '$3.25' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <EarningsCard 
                    title="Performance Stats"
                    data={[
                      { label: 'Average Rating', value: '⭐ 4.8' },
                      { label: 'Total Deliveries', value: '150' },
                      { label: 'On-time Rate', value: '95%' }
                    ]}
                  />
                </Grid>
              </Grid>
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
              {selectedOrder?.status === 'accepted' && (
                <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'picked_up'); setShowOrderModal(false); }} sx={{ background: '#2196f3' }}>Picked Up</Button>
              )}
              {selectedOrder?.status === 'picked_up' && (
                <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'out_for_delivery'); setShowOrderModal(false); }} sx={{ background: '#fc8019' }}>On the Way</Button>
              )}
              {selectedOrder?.status === 'out_for_delivery' && (
                <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'delivered'); setShowOrderModal(false); }} sx={{ background: '#4caf50' }}>Delivered</Button>
              )}
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
                    const activePartner = partners.find(p => p.id === 4) || partners[0];
                    const partnerLoc = activePartner?.currentLocation || { lat: 18.5204, lng: 73.8567 };
                    const restaurant = mockRestaurants.find(r => r.id === selectedOrder.restaurantId);
                    const restaurantLoc = restaurant?.location ? { lat: restaurant.location.latitude, lng: restaurant.location.longitude } : { lat: 19.076, lng: 72.8777 };
                    const customerLoc = selectedOrder.customerLocation || { lat: (restaurantLoc.lat || 18.52) + 0.12, lng: (restaurantLoc.lng || 73.85) + 0.12 };
                    const path = selectedOrder.status === 'accepted' ? [partnerLoc, restaurantLoc] : [restaurantLoc, customerLoc];
                    const center = selectedOrder.status === 'accepted' ? partnerLoc : restaurantLoc;
                    const phase = selectedOrder.status === 'accepted' ? 'to_restaurant' : 'to_customer';
                    // Key ensures remount on modal open/order change
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
                      />
                    );
                  })()}
                </Box>
              </Box>
              
              {/* Details Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Order Details</Typography>
                <Chip label={selectedOrder.status.replace('_',' ')} sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="body2">Customer #{selectedOrder.customerId}</Typography>
                <Typography variant="body2">Restaurant #{selectedOrder.restaurantId}</Typography>
                <Typography variant="body2">Destination: {selectedOrder.deliveryAddress}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {(() => {
                    const customer = mockUsers.find(u => u.id === selectedOrder.customerId);
                    const restaurant = mockRestaurants.find(r => r.id === selectedOrder.restaurantId);
                    const customerPhone = customer?.phone || '';
                    const restaurantPhone = restaurant?.phone || '';
                    return <>
                      <Button size="small" variant="outlined" startIcon={<Phone />} onClick={() => window.open(`tel:${customerPhone}`)}>Call Customer</Button>
                      <Button size="small" variant="outlined" startIcon={<Restaurant />} onClick={() => window.open(`tel:${restaurantPhone}`)}>Call Restaurant</Button>
                      <Button size="small" variant="outlined" startIcon={<Navigation />}>Navigate</Button>
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
              <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={() => setShowFullMap(false)} sx={{ background: '#fc8019' }}>Close</Button>
                {selectedOrder.status === 'accepted' && (
                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'picked_up'); setShowFullMap(false); }} sx={{ background: '#2196f3' }}>Picked Up</Button>
                )}
                {selectedOrder.status === 'picked_up' && (
                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'out_for_delivery'); setShowFullMap(false); }} sx={{ background: '#fc8019' }}>On the Way</Button>
                )}
                {selectedOrder.status === 'out_for_delivery' && (
                  <Button variant="contained" onClick={() => { updateDeliveryStatus(selectedOrder.id, 'delivered'); setShowFullMap(false); }} sx={{ background: '#4caf50' }}>Delivered</Button>
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
          actions={<Button variant="contained" onClick={() => setShowProfileModal(false)} sx={{ background: '#fc8019' }}>Save</Button>}
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
