import React, { useState } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, Typography } from '@mui/material';
import { LocalShipping, AttachMoney, Star, CheckCircle } from '@mui/icons-material';
import { mockOrders, mockDeliveryPartners } from '../../constants/mockData';
import DeliveryHeader from '../../components/delivery/DeliveryHeader';
import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import TabHeader from '../../components/admin/TabHeader';
import AvailableOrdersCard from '../../components/delivery/AvailableOrdersCard';
import MyOrdersTable from '../../components/delivery/MyOrdersTable';
import EarningsCard from '../../components/delivery/EarningsCard';

const DeliveryDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleStatus = () => {
    setIsOnline(!isOnline);
  };

  const availableOrders = mockOrders.filter(order => order.status === 'ready_for_pickup');
  const myOrders = mockOrders.filter(order => order.deliveryPartnerId === 4);
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
    console.log(`Accepting order ${orderId}`);
  };

  const handleCompleteOrder = (orderId) => {
    console.log(`Completing order ${orderId}`);
  };

  return (
    <Box sx={{ 
      background: '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        <DeliveryHeader isOnline={isOnline} onToggleStatus={handleToggleStatus} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
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
              <MyOrdersTable orders={myOrders} onCompleteOrder={handleCompleteOrder} />
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
      </Container>
    </Box>
  );
};

export default DeliveryDashboard;
