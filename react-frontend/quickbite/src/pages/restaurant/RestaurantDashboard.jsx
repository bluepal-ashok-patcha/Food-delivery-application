import React, { useState } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, Button,Typography } from '@mui/material';
import { Restaurant, AttachMoney, AccessTime, Star, Add } from '@mui/icons-material';
import { mockOrders, mockRestaurants } from '../../constants/mockData';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import TabHeader from '../../components/admin/TabHeader';
import RestaurantOrdersTable from '../../components/restaurant/RestaurantOrdersTable';
import MenuCard from '../../components/restaurant/MenuCard';
import AnalyticsCard from '../../components/restaurant/AnalyticsCard';

const RestaurantDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleStatus = () => {
    setIsOpen(!isOpen);
  };

  const restaurantOrders = mockOrders.filter(order => order.restaurantId === 1);
  const todayOrders = restaurantOrders.filter(order => 
    new Date(order.orderDate).toDateString() === new Date().toDateString()
  );

  const stats = [
    { 
      title: 'Today\'s Orders', 
      value: todayOrders.length, 
      icon: <Restaurant />, 
      color: '#fc8019',
      change: '+15%',
      trend: 'up',
      subtitle: 'Orders received'
    },
    { 
      title: 'Total Revenue', 
      value: '$1,234.56', 
      icon: <AttachMoney />, 
      color: '#fc8019',
      change: '+22%',
      trend: 'up',
      subtitle: 'This month'
    },
    { 
      title: 'Avg. Rating', 
      value: '4.5', 
      icon: <Star />, 
      color: '#fc8019',
      change: '+0.3',
      trend: 'up',
      subtitle: 'Customer rating'
    },
    { 
      title: 'Avg. Prep Time', 
      value: '25 min', 
      icon: <AccessTime />, 
      color: '#fc8019',
      change: '-5 min',
      trend: 'down',
      subtitle: 'Preparation time'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'info';
      case 'preparing': return 'warning';
      case 'ready_for_pickup': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleOrderAction = (orderId, action) => {
    console.log(`Order ${orderId}: ${action}`);
  };

  return (
    <Box sx={{ 
      background: '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        <RestaurantHeader isOpen={isOpen} onToggleStatus={handleToggleStatus} />

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
            <Tab label="Orders" />
            <Tab label="Menu" />
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
                title="Recent Orders" 
                subtitle="Manage incoming orders and their status"
                showAddButton={false}
              />
              <RestaurantOrdersTable orders={restaurantOrders} onOrderAction={handleOrderAction} />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Menu Management" 
                subtitle="Manage your restaurant menu items"
                addButtonText="Add Item"
              />
              
              <Grid container spacing={3}>
                {mockRestaurants && mockRestaurants.length > 0 && mockRestaurants[0].menu ? (
                  mockRestaurants[0].menu.map((category) => (
                    <Grid item xs={12} key={category.id}>
                      <Paper sx={{ 
                        p: 3,
                        borderRadius: '4px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        background: '#fff'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 3 }}>
                          {category.category}
                        </Typography>
                        <Grid container spacing={3}>
                          {category.items && category.items.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                              <MenuCard item={item} />
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 4,
                      borderRadius: '4px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      background: '#fff',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                        No menu items available
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Add menu items to get started
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Restaurant Analytics" 
                subtitle="Track your restaurant performance and insights"
                showAddButton={false}
              />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <AnalyticsCard 
                    title="Popular Items"
                    data={[
                      { label: 'Chicken Tikka', value: '45 orders' },
                      { label: 'Butter Chicken', value: '38 orders' },
                      { label: 'Biryani', value: '32 orders' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <AnalyticsCard 
                    title="Order Status Distribution"
                    data={[
                      { label: 'Delivered', value: '85%' },
                      { label: 'Preparing', value: '10%' },
                      { label: 'Cancelled', value: '5%' }
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

export default RestaurantDashboard;
