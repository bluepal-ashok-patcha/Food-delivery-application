import React, { useMemo, useState, useEffect } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, Typography, Stack, Chip, Divider, Button, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, Fab } from '@mui/material';
import { Restaurant, AttachMoney, AccessTime, Star, Add, Store } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openMapModal } from '../../store/slices/locationSlice';
import { 
  fetchMyRestaurants, 
  updateRestaurantProfile, 
  toggleRestaurantOpen,
  fetchRestaurantCategories,
  addMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  setCurrentRestaurant,
  createRestaurant,
  clearCategories,
  fetchRestaurantOrders,
  fetchRestaurantAnalytics,
  updateOrderStatus
} from '../../store/slices/restaurantSlice';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import TabHeader from '../../components/admin/TabHeader';
import RestaurantOrdersTable from '../../components/restaurant/RestaurantOrdersTable';
import MenuCard from '../../components/restaurant/MenuCard';
import AnalyticsCard from '../../components/restaurant/AnalyticsCard';
import Modal from '../../components/common/Modal';
import TextField from '../../components/common/TextField';

const RestaurantDashboard = () => {
  const dispatch = useDispatch();
  const { currentLocation, isGeocoding, selectedCoordinates } = useSelector((state) => state.location);
  const [pendingApplyMapLocation, setPendingApplyMapLocation] = useState(false);
  const { myRestaurants, categories, orders, analytics, loading, error } = useSelector((state) => state.restaurants);
  const { user } = useSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showRecentOrdersModal, setShowRecentOrdersModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: '',
    contactNumber: '',
    address: '',
    cuisineType: '',
    openingTime: '',
    closingTime: '',
    openingHours: '',
    deliveryRadiusKm: 5,
    image: '',
    coverImage: '',
    description: '',
    deliveryTime: '30-45 min',
    deliveryFee: 0,
    minimumOrder: 0,
    latitude: 0,
    longitude: 0,
    isVeg: false,
    isPureVeg: false,
    tags: '',
    rating: 0,
    totalRatings: 0
  });
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  const [showNewRestaurantModal, setShowNewRestaurantModal] = useState(false);
  const [newRestaurantData, setNewRestaurantData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    cuisineType: '',
    openingTime: '',
    closingTime: '',
    openingHours: '',
    deliveryRadiusKm: 5,
    image: '',
    coverImage: '',
    description: '',
    deliveryTime: '30-45 min',
    deliveryFee: 0,
    minimumOrder: 0,
    latitude: 0,
    longitude: 0,
    isVeg: false,
    isPureVeg: false,
    tags: ''
  });

  // Get current restaurant (selected one or first one)
  const currentRestaurant = useMemo(() => {
    if (!myRestaurants || myRestaurants.length === 0) return null;
    if (selectedRestaurantId) {
      return myRestaurants.find(r => r.id === selectedRestaurantId) || myRestaurants[0];
    }
    return myRestaurants[0];
  }, [myRestaurants, selectedRestaurantId]);
  
  const isOpen = currentRestaurant?.isOpen || false;

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  // Fetch categories when restaurant is available
  useEffect(() => {
    if (currentRestaurant?.id) {
      dispatch(fetchRestaurantCategories(currentRestaurant.id));
    }
  }, [dispatch, currentRestaurant?.id]);

  // Fetch orders when restaurant is available
  useEffect(() => {
    if (currentRestaurant?.id) {
      dispatch(fetchRestaurantOrders({ restaurantId: currentRestaurant.id }));
    }
  }, [dispatch, currentRestaurant?.id]);

  // Fetch analytics when restaurant or period changes
  useEffect(() => {
    if (currentRestaurant?.id) {
      dispatch(fetchRestaurantAnalytics({ restaurantId: currentRestaurant.id, period: analyticsPeriod }));
    }
  }, [dispatch, currentRestaurant?.id, analyticsPeriod]);

  // Update profile draft when restaurant data changes
  useEffect(() => {
    if (currentRestaurant) {
      setProfileDraft({
        name: currentRestaurant.name || '',
        contactNumber: currentRestaurant.contactNumber || '',
        address: currentRestaurant.address || '',
        cuisineType: currentRestaurant.cuisineType || '',
        openingTime: currentRestaurant.openingTime || '',
        closingTime: currentRestaurant.closingTime || '',
        openingHours: currentRestaurant.openingHours || '',
        deliveryRadiusKm: currentRestaurant.deliveryRadiusKm || 5,
        image: currentRestaurant.image || '',
        coverImage: currentRestaurant.coverImage || '',
        description: currentRestaurant.description || '',
        deliveryTime: currentRestaurant.deliveryTime || '30-45 min',
        deliveryFee: currentRestaurant.deliveryFee || 0,
        minimumOrder: currentRestaurant.minimumOrder || 0,
        latitude: currentRestaurant.latitude || 0,
        longitude: currentRestaurant.longitude || 0,
        isVeg: currentRestaurant.isVeg || false,
        isPureVeg: currentRestaurant.isPureVeg || false,
        tags: currentRestaurant.tags || '',
        rating: currentRestaurant.rating || 0,
        totalRatings: currentRestaurant.totalRatings || 0
      });
    }
  }, [currentRestaurant]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleStatus = () => {
    if (currentRestaurant?.id) {
      dispatch(toggleRestaurantOpen({ restaurantId: currentRestaurant.id, isOpen: !isOpen }));
    }
  };

  // Process orders data
  const restaurantOrders = orders || [];
  const todayOrders = typeof analytics?.todayOrders === 'number'
    ? Array.from({ length: analytics.todayOrders })
    : restaurantOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      });
  const upcomingOrders = restaurantOrders.filter(order => 
    ['PLACED', 'PREPARING'].includes(order.orderStatus)
  );
  
  // Create menu item index from categories
  const menuItemIndex = useMemo(() => {
    const idx = {};
    categories.forEach(category => {
      if (category.menuItems) {
        category.menuItems.forEach(item => {
          idx[item.id] = item;
        });
      }
    });
    return idx;
  }, [categories]);

  // Calculate total revenue
  const totalRevenue = typeof analytics?.totalRevenue === 'number'
    ? analytics.totalRevenue
    : restaurantOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);

  const stats = [
    { 
      title: 'Total Orders', 
      value: analytics?.totalOrders ?? restaurantOrders.length, 
      icon: <Restaurant />, 
      color: '#6c757d',
      change: '',
      trend: 'neutral',
      subtitle: `Today: ${analytics?.todayOrders ?? (Array.isArray(todayOrders) ? todayOrders.length : 0)}`
    },
    { 
      title: 'Total Revenue', 
      value: `$${Number(totalRevenue || 0).toFixed(2)}`, 
      icon: <AttachMoney />, 
      color: '#6c757d',
      change: '',
      trend: 'neutral',
      subtitle: `Avg: $${Number(analytics?.averageOrderValue ?? 0).toFixed(2)}`
    },
    { 
      title: 'Completion Rate', 
      value: `${Math.round((analytics?.completionRate ?? 0) * 100)}%`, 
      icon: <AccessTime />, 
      color: '#6c757d',
      change: '',
      trend: 'neutral',
      subtitle: 'Delivered / Total'
    },
    { 
      title: 'Menu Items', 
      value: categories.reduce((total, cat) => total + (cat.menuItems?.length || 0), 0), 
      icon: <Star />, 
      color: '#6c757d',
      change: '',
      trend: 'neutral',
      subtitle: 'Total items'
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
    let newStatus;
    const order = restaurantOrders.find(o => o.id === orderId);
    
    // Only allow actions based on current status and payment status
    if (order?.paymentStatus !== 'PAID' && order?.paymentStatus !== 'COMPLETED') {
      dispatch(showNotification({ 
        message: 'Cannot process order - payment not completed', 
        type: 'warning' 
      }));
      return;
    }
    
    if (action === 'accept' && order?.orderStatus === 'PENDING') {
      newStatus = 'ACCEPTED';
    } else if (action === 'reject' && order?.orderStatus === 'PENDING') {
      newStatus = 'REJECTED';
    } else if (action === 'preparing' && order?.orderStatus === 'ACCEPTED') {
      newStatus = 'PREPARING';
    } else if (action === 'ready' && order?.orderStatus === 'PREPARING') {
      newStatus = 'READY_FOR_PICKUP';
    }
    
    if (newStatus) {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
    }
  };

  const handleOrderRowClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleMenuAddClick = () => {
    setEditingItem({ 
      id: null, 
      name: '', 
      description: '', 
      price: 0, 
      originalPrice: 0, 
      imageUrl: '', 
      inStock: true, 
      isVeg: false, 
      isPopular: false, 
      preparationTime: 10, 
      customizationJson: '{}',
      nutritionJson: '{}',
      nutrition: {}
    });
    setCurrentCategoryId(categories[0]?.id || null);
    setShowItemModal(true);
  };

  const handleMenuEdit = (item, categoryId) => {
    // Parse JSON fields for editing
    const nutrition = item.nutritionJson ? JSON.parse(item.nutritionJson) : {};
    setEditingItem({ 
      ...item, 
      nutrition: nutrition 
    });
    setCurrentCategoryId(categoryId);
    setShowItemModal(true);
  };

  const saveMenuItem = () => {
    if (!editingItem) return;
    
    const itemData = {
      ...editingItem,
      price: Number(editingItem.price) || 0,
      originalPrice: editingItem.originalPrice ? Number(editingItem.originalPrice) : undefined,
      preparationTime: editingItem.preparationTime ? Number(editingItem.preparationTime) : undefined,
      isPopular: Boolean(editingItem.isPopular),
      inStock: Boolean(editingItem.inStock),
      // Convert nutrition object to JSON string for backend
      nutritionJson: editingItem.nutrition ? JSON.stringify({
        calories: editingItem.nutrition.calories || 0,
        protein: editingItem.nutrition.protein || 0,
        carbs: editingItem.nutrition.carbs || 0,
        fat: editingItem.nutrition.fat || 0,
      }) : '{}',
      // Convert customization to JSON string
      customizationJson: editingItem.customizationJson || '{}'
    };

    if (editingItem.id) {
      // Update existing item
      dispatch(updateMenuItem({ itemId: editingItem.id, itemData }));
    } else {
      // Add new item
      dispatch(addMenuItem({ categoryId: currentCategoryId, itemData }));
    }
    
    setShowItemModal(false);
    setEditingItem(null);
  };

  const removeMenuItem = () => {
    if (!editingItem?.id) return;
    dispatch(deleteMenuItem(editingItem.id));
    setShowItemModal(false);
    setEditingItem(null);
  };

  const saveProfile = () => {
    if (!profileDraft.name || !profileDraft.address || !profileDraft.contactNumber || !profileDraft.cuisineType) {
      dispatch(showNotification({ message: 'Please fill name, address, contact number, and cuisine type', type: 'error' }));
      return;
    }
    if (currentRestaurant?.id) {
      dispatch(updateRestaurantProfile({ restaurantId: currentRestaurant.id, restaurantData: profileDraft }));
      setShowProfileModal(false);
    }
  };

  React.useEffect(() => {
    if (pendingApplyMapLocation && !isGeocoding && ((selectedCoordinates?.lat && selectedCoordinates?.lng) || (currentLocation?.lat && currentLocation?.lng))) {
      const lat = selectedCoordinates?.lat ?? currentLocation.lat;
      const lng = selectedCoordinates?.lng ?? currentLocation.lng;
      setProfileDraft(d => ({ ...d, latitude: lat, longitude: lng, address: d.address || currentLocation.address }));
      setPendingApplyMapLocation(false);
    }
  }, [pendingApplyMapLocation, isGeocoding, currentLocation, selectedCoordinates]);

  const manageCategories = (action, payload) => {
    if (!currentRestaurant?.id) return;
    
    if (action === 'add') {
      dispatch(addMenuCategory({ 
        restaurantId: currentRestaurant.id, 
        categoryData: { name: payload || 'New Category' } 
      }));
    } else if (action === 'rename') {
      dispatch(updateMenuCategory({ 
        categoryId: payload.id, 
        categoryData: { name: payload.name } 
      }));
    } else if (action === 'remove') {
      dispatch(deleteMenuCategory(payload));
    }
  };

  const handleRestaurantChange = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    // Clear categories when switching restaurants
    dispatch(clearCategories());
  };

  const handleCreateRestaurant = () => {
    if (newRestaurantData.name && newRestaurantData.address) {
      dispatch(createRestaurant(newRestaurantData));
      setShowNewRestaurantModal(false);
      setNewRestaurantData({
        name: '',
        contactNumber: '',
        address: '',
        cuisineType: '',
        openingTime: '',
        closingTime: '',
        openingHours: '',
        deliveryRadiusKm: 5,
        image: '',
        coverImage: '',
        description: '',
        deliveryTime: '30-45 min',
        deliveryFee: 0,
        minimumOrder: 0,
        latitude: 0,
        longitude: 0,
        isVeg: false,
        isPureVeg: false,
        tags: ''
      });
    }
  };

  // Show loading state if no restaurant data
  if (loading.myRestaurants) {
    return (
      <Box sx={{ 
        background: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error.myRestaurants) {
    return (
      <Box sx={{ 
        background: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error.myRestaurants}
        </Alert>
      </Box>
    );
  }

  // Show no restaurant message
  if (!currentRestaurant) {
    return (
      <Box sx={{ 
        background: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Alert severity="info" sx={{ maxWidth: 500 }}>
          No restaurant found. Please contact support to set up your restaurant.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        {/* Restaurant Selector Header */}
        <Paper sx={{ 
          mb: 3,
          p: 3,
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Store sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  My Restaurants
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage your restaurant portfolio
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowNewRestaurantModal(true)}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              Add Restaurant
            </Button>
          </Box>
          
          {myRestaurants && myRestaurants.length > 0 && (
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel sx={{ color: 'white' }}>Select Restaurant</InputLabel>
              <Select
                value={selectedRestaurantId || myRestaurants[0]?.id || ''}
                onChange={(e) => handleRestaurantChange(e.target.value)}
                label="Select Restaurant"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                {myRestaurants.map((restaurant) => (
                  <MenuItem key={restaurant.id} value={restaurant.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Restaurant sx={{ fontSize: 20 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {restaurant.name}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {restaurant.address}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Paper>

        <RestaurantHeader 
          isOpen={isOpen} 
          onToggleStatus={handleToggleStatus} 
          onEditProfile={() => setShowProfileModal(true)} 
          onOpenRecentOrders={() => setShowRecentOrdersModal(true)} 
        />

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
              {upcomingOrders.length > 0 && (
                <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #eee' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                    Upcoming Orders
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {upcomingOrders.slice(0, 8).map(u => (
                      <Chip key={u.id} label={`#${u.id} • ${u.status}`} onClick={() => handleOrderRowClick(u)} sx={{ cursor: 'pointer' }} />
                    ))}
                  </Stack>
                </Paper>
              )}
              {loading.orders ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
              <RestaurantOrdersTable orders={restaurantOrders} onOrderAction={handleOrderAction} onRowClick={handleOrderRowClick} />
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Menu Management" 
                subtitle="Manage your restaurant menu items"
                addButtonText="Add Item"
                onAddClick={handleMenuAddClick}
              />
              
              {loading.categories ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Grid item xs={12} key={category.id}>
                        <Paper sx={{ 
                          p: 3,
                          borderRadius: '4px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          background: '#fff'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                              {category.name}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="outlined" onClick={() => { setShowCategoriesModal(true); setCurrentCategoryId(category.id); }} sx={{ textTransform: 'none' }}>Manage Categories</Button>
                            </Stack>
                          </Box>
                          <Grid container spacing={3}>
                            {category.menuItems && category.menuItems.map((item) => (
                              <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <MenuCard item={item} onEdit={(it) => handleMenuEdit(it, category.id)} />
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
                          No menu categories available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Add menu categories and items to get started
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Restaurant Analytics" 
                subtitle="Track your restaurant performance and insights"
                showAddButton={false}
              />
              <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Period</Typography>
                <Select size="small" value={analyticsPeriod} onChange={(e) => setAnalyticsPeriod(e.target.value)} sx={{ width: 160 }}>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
                {loading.analytics && <CircularProgress size={20} />}
              </Stack>

              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <EnhancedStatCard stat={{ title: 'Total Orders', value: analytics?.totalOrders ?? 0, icon: <Restaurant />, color: '#6c757d', subtitle: `Today: ${analytics?.todayOrders ?? 0}` }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <EnhancedStatCard stat={{ title: 'Total Revenue', value: `$${(analytics?.totalRevenue ?? 0).toLocaleString()}`, icon: <AttachMoney />, color: '#6c757d', subtitle: `Today: $${(analytics?.todayRevenue ?? 0).toLocaleString()}` }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <EnhancedStatCard stat={{ title: 'Completion Rate', value: `${Math.round((analytics?.completionRate ?? 0) * 100)}%`, icon: <AccessTime />, color: '#6c757d', subtitle: 'Delivered / Total' }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <EnhancedStatCard stat={{ title: 'Avg Order Value', value: `$${Number(analytics?.averageOrderValue ?? 0).toFixed(2)}`, icon: <AttachMoney />, color: '#6c757d', subtitle: 'Across period' }} />
                </Grid>
              </Grid>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <AnalyticsCard 
                    title="Popular Items"
                    data={(analytics?.popularItems || []).slice(0,5).map(pi => ({ label: pi.name || pi.label, value: `${pi.count || pi.value || 0} orders` }))}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <AnalyticsCard 
                    title="Order Status Distribution"
                    data={(analytics?.orderStatusDistribution || analytics?.statusDistribution || []).map(s => ({ label: (s.status || s.label || '').toString().replace('_',' '), value: s.count || s.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Order Details Modal */}
        <Modal
          open={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={selectedOrder ? `Order ${selectedOrder.id}` : 'Order'}
          maxWidth="sm"
          fullWidth
          actions={
            <Stack direction="row" spacing={1}>
              {(selectedOrder?.paymentStatus === 'PAID' || selectedOrder?.paymentStatus === 'COMPLETED') && (
                <>
                  {selectedOrder?.orderStatus === 'PENDING' && (
                    <>
                      <Button variant="contained" onClick={() => { handleOrderAction(selectedOrder.id, 'accept'); setShowOrderModal(false); }} sx={{ background: '#28a745', fontWeight: 500 }}>Accept</Button>
                      <Button variant="outlined" onClick={() => { handleOrderAction(selectedOrder.id, 'reject'); setShowOrderModal(false); }} sx={{ borderColor: '#dc3545', color: '#dc3545', fontWeight: 500 }}>Reject</Button>
                </>
              )}
                  {selectedOrder?.orderStatus === 'ACCEPTED' && (
                    <Button variant="contained" onClick={() => { handleOrderAction(selectedOrder.id, 'preparing'); setShowOrderModal(false); }} sx={{ background: '#fd7e14', fontWeight: 500 }}>Start Preparing</Button>
                  )}
                  {selectedOrder?.orderStatus === 'PREPARING' && (
                    <Button variant="contained" onClick={() => { handleOrderAction(selectedOrder.id, 'ready'); setShowOrderModal(false); }} sx={{ background: '#6f42c1', fontWeight: 500 }}>Mark Ready</Button>
                  )}
                </>
              )}
              {(selectedOrder?.paymentStatus !== 'PAID' && selectedOrder?.paymentStatus !== 'COMPLETED') && (
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  Awaiting Payment Completion
                </Typography>
              )}
              <Button onClick={() => setShowOrderModal(false)}>Close</Button>
            </Stack>
          }
        >
          {selectedOrder && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>Customer {selectedOrder.userId}</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>{selectedOrder.deliveryAddress}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip 
                    label={`Payment: ${(selectedOrder.paymentStatus || 'PENDING').replace('_',' ')}`} 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 500,
                      borderColor: selectedOrder.paymentStatus === 'PAID' || selectedOrder.paymentStatus === 'COMPLETED' ? '#28a745' : 
                                 selectedOrder.paymentStatus === 'FAILED' ? '#dc3545' : '#6c757d',
                      color: selectedOrder.paymentStatus === 'PAID' || selectedOrder.paymentStatus === 'COMPLETED' ? '#28a745' : 
                             selectedOrder.paymentStatus === 'FAILED' ? '#dc3545' : '#6c757d',
                      fontSize: '12px'
                    }} 
                  />
                  <Chip 
                    label={`Order: ${(selectedOrder.orderStatus || 'Unknown').replace('_',' ')}`} 
                    variant="outlined"
                    sx={{ fontWeight: 500, fontSize: '12px' }} 
                  />
                </Box>
              </Box>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Items</Typography>
              <Stack spacing={1}>
                {selectedOrder.items?.map((it, idx) => {
                  const info = menuItemIndex[it.menuItemId] || {};
                  return (
                    <Paper key={idx} sx={{ p: 1.5, border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 1, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                        {info.imageUrl ? (
                          <img src={info.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>No Image</Box>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{it.quantity}x {it.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#777' }}>
                          Item ID: {it.menuItemId}
                          </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ${Number((it.price || 0) * it.quantity).toFixed(2)}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
              <Divider />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(selectedOrder.totalAmount || 0).toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Delivery</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>$0.00</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tax</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>$0.00</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Total</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>${Number(selectedOrder.totalAmount || 0).toFixed(2)}</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ color: '#666' }}>Special: {selectedOrder.specialInstructions || '—'}</Typography>
            </Stack>
          )}
        </Modal>

        {/* Recent Orders (quick view) Modal from kebab menu */}
        <Modal
          open={showRecentOrdersModal}
          onClose={() => setShowRecentOrdersModal(false)}
          title="Recent Orders"
          maxWidth="md"
          fullWidth
          actions={<Button onClick={() => setShowRecentOrdersModal(false)}>Close</Button>}
        >
          <RestaurantOrdersTable orders={restaurantOrders.slice(0, 10)} onOrderAction={handleOrderAction} onRowClick={handleOrderRowClick} />
        </Modal>

        {/* Menu Item Modal */}
        <Modal
          open={showItemModal}
          onClose={() => setShowItemModal(false)}
          title={editingItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}
          maxWidth="md"
          fullWidth
          actions={
            <Stack direction="row" spacing={1}>
              {editingItem?.id && (
                <Button color="error" variant="outlined" onClick={removeMenuItem}>Remove</Button>
              )}
              <Button variant="contained" onClick={saveMenuItem} sx={{ background: '#fc8019' }}>Save</Button>
            </Stack>
          }
        >
          {editingItem && (
            <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
              <Stack spacing={3}>
                {/* Basic Information */}
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Basic Information</Typography>
            <Stack spacing={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
              <TextField 
                select 
                          label="Category *" 
                fullWidth 
                value={currentCategoryId || ''} 
                onChange={(e) => setCurrentCategoryId(e.target.value)}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Item Name *" 
                          fullWidth 
                          value={editingItem.name} 
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Preparation Time (minutes)" 
                          type="number" 
                          fullWidth 
                          value={editingItem.preparationTime} 
                          onChange={(e) => setEditingItem({ ...editingItem, preparationTime: Number(e.target.value) })} 
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField 
                          label="Description" 
                          fullWidth 
                          multiline 
                          rows={3} 
                          value={editingItem.description} 
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} 
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField 
                          label="Image URL" 
                          fullWidth 
                          value={editingItem.imageUrl} 
                          onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })} 
                        />
                      </Grid>
                    </Grid>
              </Stack>
                </Paper>

                {/* Pricing */}
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Pricing</Typography>
                  <Stack spacing={2}>
              <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Current Price ($) *" 
                          type="number" 
                          step="0.01"
                          fullWidth 
                          value={editingItem.price} 
                          onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} 
                        />
                </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Original Price ($)" 
                          type="number" 
                          step="0.01"
                          fullWidth 
                          value={editingItem.originalPrice} 
                          onChange={(e) => setEditingItem({ ...editingItem, originalPrice: Number(e.target.value) })} 
                        />
                </Grid>
                </Grid>
                  </Stack>
                </Paper>

                {/* Item Properties */}
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Item Properties</Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button 
                        variant={editingItem.isVeg ? 'contained' : 'outlined'} 
                        onClick={() => setEditingItem({ ...editingItem, isVeg: !editingItem.isVeg })}
                        sx={{ 
                          textTransform: 'none',
                          ...(editingItem.isVeg ? { background: '#4caf50', '&:hover': { background: '#45a049' } } : {})
                        }}
                      >
                        {editingItem.isVeg ? '✓ Veg' : 'Non-Veg'}
                      </Button>
                      <Button 
                        variant={editingItem.isPopular ? 'contained' : 'outlined'} 
                        onClick={() => setEditingItem({ ...editingItem, isPopular: !editingItem.isPopular })}
                        sx={{ 
                          textTransform: 'none',
                          ...(editingItem.isPopular ? { background: '#ff9800', '&:hover': { background: '#f57c00' } } : {})
                        }}
                      >
                        {editingItem.isPopular ? '★ Popular' : 'Mark Popular'}
                      </Button>
                      <Button 
                        variant={editingItem.inStock ? 'contained' : 'outlined'} 
                        onClick={() => setEditingItem({ ...editingItem, inStock: !editingItem.inStock })}
                        sx={{ 
                          textTransform: 'none',
                          ...(editingItem.inStock ? { background: '#4caf50', '&:hover': { background: '#45a049' } } : { background: '#f44336', '&:hover': { background: '#da190b' } })
                        }}
                      >
                        {editingItem.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Nutrition Information */}
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Nutrition Information</Typography>
                  <Stack spacing={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Calories" 
                          type="number" 
                          fullWidth 
                          value={editingItem.nutrition?.calories || ''} 
                          onChange={(e) => {
                            const nutrition = JSON.parse(editingItem.nutritionJson || '{}');
                            nutrition.calories = e.target.value;
                            setEditingItem({ ...editingItem, nutritionJson: JSON.stringify(nutrition) });
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Protein (g)" 
                          type="number" 
                          step="0.1"
                          fullWidth 
                          value={editingItem.nutrition?.protein || ''} 
                          onChange={(e) => {
                            const nutrition = JSON.parse(editingItem.nutritionJson || '{}');
                            nutrition.protein = e.target.value;
                            setEditingItem({ ...editingItem, nutritionJson: JSON.stringify(nutrition) });
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Carbs (g)" 
                          type="number" 
                          step="0.1"
                          fullWidth 
                          value={editingItem.nutrition?.carbs || ''} 
                          onChange={(e) => {
                            const nutrition = JSON.parse(editingItem.nutritionJson || '{}');
                            nutrition.carbs = e.target.value;
                            setEditingItem({ ...editingItem, nutritionJson: JSON.stringify(nutrition) });
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField 
                          label="Fat (g)" 
                          type="number" 
                          step="0.1"
                          fullWidth 
                          value={editingItem.nutrition?.fat || ''} 
                          onChange={(e) => {
                            const nutrition = JSON.parse(editingItem.nutritionJson || '{}');
                            nutrition.fat = e.target.value;
                            setEditingItem({ ...editingItem, nutritionJson: JSON.stringify(nutrition) });
                          }} 
                        />
                </Grid>
              </Grid>
            </Stack>
                </Paper>

                {/* Customization Options */}
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Customization Options</Typography>
                  <Stack spacing={2}>
                    <TextField 
                      label="Customization JSON" 
                      fullWidth 
                      multiline 
                      rows={4}
                      placeholder='{"sizes": ["Small", "Medium", "Large"], "extras": ["Extra Cheese", "Extra Sauce"]}'
                      value={editingItem.customizationJson} 
                      onChange={(e) => setEditingItem({ ...editingItem, customizationJson: e.target.value })} 
                      helperText="Enter valid JSON for customization options"
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          )}
        </Modal>

        {/* Categories Modal */}
        <Modal
          open={showCategoriesModal}
          onClose={() => setShowCategoriesModal(false)}
          title="Manage Categories"
          maxWidth="sm"
          fullWidth
          actions={<Button onClick={() => setShowCategoriesModal(false)}>Close</Button>}
        >
          <Stack spacing={1}>
            {categories.map(c => (
              <Stack key={c.id} direction="row" spacing={1} alignItems="center">
                <TextField fullWidth value={c.name} onChange={(e) => manageCategories('rename', { id: c.id, name: e.target.value })} />
                <Button color="error" variant="outlined" onClick={() => manageCategories('remove', c.id)}>Remove</Button>
              </Stack>
            ))}
            <Button variant="contained" onClick={() => manageCategories('add', 'New Category')} sx={{ background: '#fc8019' }}>Add Category</Button>
          </Stack>
        </Modal>

        {/* Profile Modal */}
        <Modal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Edit Restaurant Profile"
          maxWidth="lg"
          fullWidth
          actions={<Button variant="contained" onClick={saveProfile} sx={{ background: '#fc8019' }}>Save Changes</Button>}
        >
          <Box sx={{ maxHeight: '80vh', overflowY: 'auto', p: 1 }}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Basic Information</Typography>
          <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Restaurant Name" 
                        fullWidth 
                        value={profileDraft.name} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Contact Number" 
                        fullWidth 
                        value={profileDraft.contactNumber} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, contactNumber: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Address" 
                        fullWidth 
                        multiline 
                        rows={2} 
                        value={profileDraft.address} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, address: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Cuisine Type" 
                        fullWidth 
                        value={profileDraft.cuisineType} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, cuisineType: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Tags (comma-separated)" 
                        fullWidth 
                        placeholder="Popular, Fast Delivery, Best Seller"
                        value={profileDraft.tags} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, tags: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Description" 
                        fullWidth 
                        multiline 
                        rows={3}
                        value={profileDraft.description} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, description: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
          </Stack>
              </Paper>

              {/* Operating Hours */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Operating Hours</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Opening Time" 
                        type="time"
                        fullWidth 
                        value={profileDraft.openingTime} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, openingTime: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Closing Time" 
                        type="time"
                        fullWidth 
                        value={profileDraft.closingTime} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, closingTime: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Business Hours (Text)" 
                        fullWidth 
                        placeholder="10:00 AM - 11:00 PM"
                        value={profileDraft.openingHours} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, openingHours: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* Delivery Settings (New Restaurant) */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Delivery Settings</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Delivery Radius (km)" 
                        type="number" 
                        fullWidth 
                        value={profileDraft.deliveryRadiusKm} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, deliveryRadiusKm: Number(e.target.value) })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Delivery Fee ($)" 
                        type="number" 
                        step="0.01"
                        fullWidth 
                        value={profileDraft.deliveryFee} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, deliveryFee: Number(e.target.value) })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Minimum Order ($)" 
                        type="number" 
                        step="0.01"
                        fullWidth 
                        value={profileDraft.minimumOrder} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, minimumOrder: Number(e.target.value) })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Delivery Time" 
                        fullWidth 
                        placeholder="30-45 min"
                        value={profileDraft.deliveryTime} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, deliveryTime: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField label="Latitude" type="number" value={profileDraft.latitude || ''} onChange={(e) => setProfileDraft({ ...profileDraft, latitude: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField label="Longitude" type="number" value={profileDraft.longitude || ''} onChange={(e) => setProfileDraft({ ...profileDraft, longitude: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Button fullWidth variant="outlined" size="medium" onClick={() => dispatch(openMapModal())}>Select on Map</Button>
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Button fullWidth variant="contained" size="medium" disabled={isGeocoding} onClick={() => {
                            if (isGeocoding) { setPendingApplyMapLocation(true); return; }
                            const lat = selectedCoordinates?.lat ?? currentLocation.lat;
                            const lng = selectedCoordinates?.lng ?? currentLocation.lng;
                            setProfileDraft({ ...profileDraft, latitude: lat, longitude: lng, address: profileDraft.address || currentLocation.address });
                          }} sx={{ background: '#fc8019' }}>{isGeocoding ? 'Loading…' : 'Use Selected'}</Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
                        <Button 
                          variant={profileDraft.isVeg ? 'contained' : 'outlined'} 
                          onClick={() => setProfileDraft({ ...profileDraft, isVeg: !profileDraft.isVeg })}
                          sx={{ textTransform: 'none' }}
                        >
                          {profileDraft.isVeg ? 'Veg' : 'Non-Veg'}
                        </Button>
                        <Button 
                          variant={profileDraft.isPureVeg ? 'contained' : 'outlined'} 
                          onClick={() => setProfileDraft({ ...profileDraft, isPureVeg: !profileDraft.isPureVeg })}
                          sx={{ textTransform: 'none' }}
                        >
                          {profileDraft.isPureVeg ? 'Pure Veg' : 'Mixed'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* Images */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Images</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Logo Image URL" 
                        fullWidth 
                        value={profileDraft.image} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, image: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Cover Image URL" 
                        fullWidth 
                        value={profileDraft.coverImage} 
                        onChange={(e) => setProfileDraft({ ...profileDraft, coverImage: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Modal>

        {/* New Restaurant Modal */}
        <Modal
          open={showNewRestaurantModal}
          onClose={() => setShowNewRestaurantModal(false)}
          title="Add New Restaurant"
          maxWidth="lg"
          fullWidth
          actions={
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setShowNewRestaurantModal(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateRestaurant} sx={{ background: '#fc8019' }}>Create Restaurant</Button>
            </Stack>
          }
        >
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Fill in the details to create a new restaurant. Your application will be reviewed by our admin team.
            </Typography>
            
            <Stack spacing={3}>
              {/* Basic Information */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Basic Information</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Restaurant Name *" 
                        fullWidth 
                        value={newRestaurantData.name} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, name: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Contact Number *" 
                        fullWidth 
                        value={newRestaurantData.contactNumber} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, contactNumber: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Address *" 
                        fullWidth 
                        multiline 
                        rows={2} 
                        value={newRestaurantData.address} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, address: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Cuisine Type *" 
                        fullWidth 
                        value={newRestaurantData.cuisineType} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, cuisineType: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Tags (comma-separated)" 
                        fullWidth 
                        placeholder="Popular, Fast Delivery, Best Seller"
                        value={newRestaurantData.tags} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, tags: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Description" 
                        fullWidth 
                        multiline 
                        rows={3}
                        value={newRestaurantData.description} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, description: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* Operating Hours */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Operating Hours</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Opening Time" 
                        type="time"
                        fullWidth 
                        value={newRestaurantData.openingTime} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, openingTime: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Closing Time" 
                        type="time"
                        fullWidth 
                        value={newRestaurantData.closingTime} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, closingTime: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Business Hours (Text)" 
                        fullWidth 
                        placeholder="10:00 AM - 11:00 PM"
                        value={newRestaurantData.openingHours} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, openingHours: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* Delivery Settings */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Delivery Settings</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Delivery Radius (km)" 
                        type="number" 
                        fullWidth 
                        value={newRestaurantData.deliveryRadiusKm} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, deliveryRadiusKm: Number(e.target.value) })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Delivery Fee ($)" 
                        type="number" 
                        step="0.01"
                        fullWidth 
                        value={newRestaurantData.deliveryFee} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, deliveryFee: Number(e.target.value) })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Minimum Order ($)" 
                        type="number" 
                        step="0.01"
                        fullWidth 
                        value={newRestaurantData.minimumOrder} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, minimumOrder: Number(e.target.value) })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Delivery Time" 
                        fullWidth 
                        placeholder="30-45 min"
                        value={newRestaurantData.deliveryTime} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, deliveryTime: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField label="Latitude" type="number" value={newRestaurantData.latitude || ''} onChange={(e) => setNewRestaurantData({ ...newRestaurantData, latitude: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField label="Longitude" type="number" value={newRestaurantData.longitude || ''} onChange={(e) => setNewRestaurantData({ ...newRestaurantData, longitude: e.target.value })} fullWidth />
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Button fullWidth variant="outlined" size="medium" onClick={() => dispatch(openMapModal())}>Select on Map</Button>
                        </Grid>
                        <Grid item xs={6} md={2}>
                          <Button fullWidth variant="contained" size="medium" disabled={isGeocoding} onClick={() => {
                            if (isGeocoding) { return; }
                            const lat = selectedCoordinates?.lat ?? currentLocation.lat;
                            const lng = selectedCoordinates?.lng ?? currentLocation.lng;
                            setNewRestaurantData({ ...newRestaurantData, latitude: lat, longitude: lng, address: newRestaurantData.address || currentLocation.address });
                          }} sx={{ background: '#fc8019' }}>{isGeocoding ? 'Loading…' : 'Use Selected'}</Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
                        <Button 
                          variant={newRestaurantData.isVeg ? 'contained' : 'outlined'} 
                          onClick={() => setNewRestaurantData({ ...newRestaurantData, isVeg: !newRestaurantData.isVeg })}
                          sx={{ textTransform: 'none' }}
                        >
                          {newRestaurantData.isVeg ? 'Veg' : 'Non-Veg'}
                        </Button>
                        <Button 
                          variant={newRestaurantData.isPureVeg ? 'contained' : 'outlined'} 
                          onClick={() => setNewRestaurantData({ ...newRestaurantData, isPureVeg: !newRestaurantData.isPureVeg })}
                          sx={{ textTransform: 'none' }}
                        >
                          {newRestaurantData.isPureVeg ? 'Pure Veg' : 'Mixed'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>

              {/* Images */}
              <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Images</Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Logo Image URL" 
                        fullWidth 
                        value={newRestaurantData.image} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, image: e.target.value })} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Cover Image URL" 
                        fullWidth 
                        value={newRestaurantData.coverImage} 
                        onChange={(e) => setNewRestaurantData({ ...newRestaurantData, coverImage: e.target.value })} 
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default RestaurantDashboard;
