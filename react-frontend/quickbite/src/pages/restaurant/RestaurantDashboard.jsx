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
  IconButton,
  Switch
} from '@mui/material';
import { 
  Restaurant, 
  AttachMoney, 
  AccessTime, 
  Star,
  CheckCircle,
  Cancel,
  Edit,
  Add
} from '@mui/icons-material';
import { mockOrders, mockRestaurants } from '../../constants/mockData';

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
    { title: 'Today\'s Orders', value: todayOrders.length, icon: <Restaurant />, color: '#2196f3' },
    { title: 'Total Revenue', value: '$1,234.56', icon: <AttachMoney />, color: '#4caf50' },
    { title: 'Avg. Rating', value: '4.5', icon: <Star />, color: '#ff9800' },
    { title: 'Avg. Prep Time', value: '25 min', icon: <AccessTime />, color: '#9c27b0' },
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Restaurant Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            Restaurant Status:
          </Typography>
          <Switch
            checked={isOpen}
            onChange={handleToggleStatus}
            color="success"
          />
          <Typography variant="body1" color={isOpen ? 'success.main' : 'error.main'}>
            {isOpen ? 'Open' : 'Closed'}
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
          <Tab label="Orders" />
          <Tab label="Menu" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper>
        {/* Orders Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Orders
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {restaurantOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>Customer {order.customerId}</TableCell>
                      <TableCell>
                        {order.items.map((item, index) => (
                          <Typography key={index} variant="body2">
                            {item.quantity}x {item.name}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status.replace('_', ' ').toUpperCase()} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {order.status === 'placed' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleOrderAction(order.id, 'accept')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleOrderAction(order.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOrderAction(order.id, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Menu Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Menu Management
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Add Item
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {mockRestaurants[0]?.menu?.map((category) => (
                <Grid item xs={12} key={category.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {category.category}
                    </Typography>
                    <Grid container spacing={2}>
                      {category.items.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {item.name}
                                </Typography>
                                <IconButton size="small">
                                  <Edit />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {item.description}
                              </Typography>
                              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                ${item.price}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={item.isAvailable ? 'Available' : 'Out of Stock'} 
                                  color={item.isAvailable ? 'success' : 'error'}
                                  size="small"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Restaurant Analytics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Popular Items
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Chicken Tikka</Typography>
                      <Typography>45 orders</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Butter Chicken</Typography>
                      <Typography>38 orders</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Biryani</Typography>
                      <Typography>32 orders</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Status Distribution
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Delivered</Typography>
                      <Typography>85%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Preparing</Typography>
                      <Typography>10%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Cancelled</Typography>
                      <Typography>5%</Typography>
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

export default RestaurantDashboard;
