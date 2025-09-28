import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  LocalShipping, 
  AttachMoney, 
  AccessTime, 
  Star,
  CheckCircle,
  Navigation,
  Phone,
  LocationOn
} from '@mui/icons-material';
import { mockOrders, mockDeliveryPartners } from '../../constants/mockData';

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
    { title: 'Available Orders', value: availableOrders.length, icon: <LocalShipping />, color: '#2196f3' },
    { title: 'My Orders', value: myOrders.length, icon: <CheckCircle />, color: '#4caf50' },
    { title: 'Today\'s Earnings', value: '$45.50', icon: <AttachMoney />, color: '#ff9800' },
    { title: 'Avg. Rating', value: '4.8', icon: <Star />, color: '#9c27b0' },
  ];

  const handleAcceptOrder = (orderId) => {
    console.log(`Accepting order ${orderId}`);
  };

  const handleCompleteOrder = (orderId) => {
    console.log(`Completing order ${orderId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Delivery Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            Status:
          </Typography>
          <Switch
            checked={isOnline}
            onChange={handleToggleStatus}
            color="success"
          />
          <Typography variant="body1" color={isOnline ? 'success.main' : 'error.main'}>
            {isOnline ? 'Online' : 'Offline'}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ backgroundColor: stat.color, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Available Orders" />
          <Tab label="My Orders" />
          <Tab label="Earnings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper>
        {/* Available Orders Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Available Orders
            </Typography>
            
            {availableOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No available orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back later for new delivery opportunities
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {availableOrders.map((order) => (
                  <Grid item xs={12} md={6} key={order.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Order #{order.id}
                          </Typography>
                          <Chip label="Ready for Pickup" color="primary" size="small" />
                        </Box>
                        
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOn />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Pickup Location"
                              secondary="Restaurant Name"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOn />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Delivery Address"
                              secondary={order.deliveryAddress}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AttachMoney />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Delivery Fee"
                              secondary={`$${order.deliveryFee}`}
                            />
                          </ListItem>
                        </List>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<CheckCircle />}
                            onClick={() => handleAcceptOrder(order.id)}
                          >
                            Accept Order
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* My Orders Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              My Orders
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Restaurant</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Earnings</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>Customer {order.customerId}</TableCell>
                      <TableCell>Restaurant {order.restaurantId}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status.replace('_', ' ').toUpperCase()} 
                          color={order.status === 'delivered' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${order.deliveryFee}</TableCell>
                      <TableCell>
                        {order.status === 'out_for_delivery' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Navigation />}
                            >
                              Navigate
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Phone />}
                            >
                              Call
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              Complete
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Earnings Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Earnings & Performance
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Today's Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Completed Deliveries</Typography>
                      <Typography>{completedOrders.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Earnings</Typography>
                      <Typography>$45.50</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Average per Delivery</Typography>
                      <Typography>$3.25</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Stats
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Average Rating</Typography>
                      <Typography>⭐ 4.8</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Deliveries</Typography>
                      <Typography>150</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>On-time Rate</Typography>
                      <Typography>95%</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DeliveryDashboard;
