import React, { useState } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab } from '@mui/material';
import { People, Restaurant, AttachMoney, LocalShipping } from '@mui/icons-material';
import { mockUsers, mockRestaurants, mockOrders, mockDeliveryPartners } from '../../constants/mockData';
import AdminHeader from '../../components/admin/AdminHeader';
import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import TabHeader from '../../components/admin/TabHeader';
import UsersTable from '../../components/admin/UsersTable';
import RestaurantsTable from '../../components/admin/RestaurantsTable';
import OrdersTable from '../../components/admin/OrdersTable';
import DeliveryPartnersTable from '../../components/admin/DeliveryPartnersTable';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const stats = [
    { 
      title: 'Total Users', 
      value: mockUsers.length, 
      icon: <People />, 
      color: '#fc8019',
      change: '+12%',
      trend: 'up',
      subtitle: 'Active users'
    },
    { 
      title: 'Restaurants', 
      value: mockRestaurants.length, 
      icon: <Restaurant />, 
      color: '#fc8019',
      change: '+8%',
      trend: 'up',
      subtitle: 'Partner restaurants'
    },
    { 
      title: 'Total Orders', 
      value: mockOrders.length, 
      icon: <AttachMoney />, 
      color: '#fc8019',
      change: '+23%',
      trend: 'up',
      subtitle: 'This month'
    },
    { 
      title: 'Delivery Partners', 
      value: mockDeliveryPartners.length, 
      icon: <LocalShipping />, 
      color: '#fc8019',
      change: '+5%',
      trend: 'up',
      subtitle: 'Active partners'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'preparing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ 
      background: '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        <AdminHeader />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <EnhancedStatCard stat={stat} />
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Tabs */}
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
            <Tab label="Users" />
            <Tab label="Restaurants" />
            <Tab label="Orders" />
            <Tab label="Delivery Partners" />
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
                title="User Management" 
                subtitle="Manage platform users and their roles"
                addButtonText="Add User"
              />
              <UsersTable users={mockUsers} />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Restaurant Management" 
                subtitle="Manage partner restaurants and their details"
                addButtonText="Add Restaurant"
              />
              <RestaurantsTable restaurants={mockRestaurants} />
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Order Management" 
                subtitle="Monitor and manage all platform orders"
                showAddButton={false}
              />
              <OrdersTable orders={mockOrders} getStatusColor={getStatusColor} />
            </Box>
          )}

          {tabValue === 3 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Delivery Partner Management" 
                subtitle="Manage delivery partners and their performance"
                addButtonText="Add Partner"
              />
              <DeliveryPartnersTable partners={mockDeliveryPartners} />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;