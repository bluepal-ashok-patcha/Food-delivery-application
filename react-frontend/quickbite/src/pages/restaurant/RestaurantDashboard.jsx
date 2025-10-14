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
import { LineChart, BarChart, PieChart, AreaChart, ChartControls } from '../../components/charts';
import Modal from '../../components/common/Modal';
import TextField from '../../components/common/TextField';
import RestaurantFormModal from '../../components/restaurant/RestaurantFormModal';

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
  // Track original category of item while editing, to support moving between categories
  const [originalCategoryId, setOriginalCategoryId] = useState(null);
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

  // Normalize completion rate to percentage (handles ratio or percent from backend)
  const completionRatePercent = (() => {
    const raw = analytics?.completionRate;
    let percent = 0;
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
      percent = raw > 1 ? raw : raw * 100;
    } else {
      const delivered = analytics?.deliveredOrders ?? analytics?.delivered ?? analytics?.completedOrders;
      const total = analytics?.totalOrders ?? analytics?.total;
      if (typeof delivered === 'number' && typeof total === 'number' && total > 0) {
        percent = (delivered / total) * 100;
      }
    }
    percent = Math.round(Math.min(100, Math.max(0, percent)));
    return percent;
  })();

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
      value: `₹${Number(totalRevenue || 0).toFixed(0)}`, 
      icon: <AttachMoney />, 
      color: '#6c757d',
      change: '',
      trend: 'neutral',
      subtitle: `Avg: ₹${Number(analytics?.averageOrderValue ?? 0).toFixed(0)}`
    },
    { 
      title: 'Completion Rate', 
      value: `${completionRatePercent}%`, 
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
    setOriginalCategoryId(categories[0]?.id || null);
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
    setOriginalCategoryId(categoryId);
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
        calories: Number(editingItem.nutrition.calories) || 0,
        protein: Number(editingItem.nutrition.protein) || 0,
        carbs: Number(editingItem.nutrition.carbs) || 0,
        fat: Number(editingItem.nutrition.fat) || 0,
      }) : '{}',
      // Convert customization to JSON string
      customizationJson: editingItem.customizationJson || '{}'
    };

    if (editingItem.id) {
      // Always update in place; send target category id to backend
      const updatePayload = { ...itemData, categoryId: currentCategoryId };
      dispatch(updateMenuItem({ itemId: editingItem.id, itemData: updatePayload }));
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
          borderRadius: '3px',
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
          borderRadius: '3px',
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
          borderRadius: '3px',
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
                      <Chip key={u.id} label={`#${u.id} • ${u.status}`} variant="outlined" onClick={() => handleOrderRowClick(u)} sx={{ cursor: 'pointer' }} />
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
                extraActions={(
                  <Button size="medium" variant="outlined" onClick={() => { setShowCategoriesModal(true); setCurrentCategoryId(null); }} sx={{ textTransform: 'none' }}>Add Category</Button>
                )}
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
                          borderRadius: '3px',
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
                        borderRadius: '3px',
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
              <ChartControls
                period={analyticsPeriod}
                onPeriodChange={(newPeriod) => {
                  setAnalyticsPeriod(newPeriod);
                  dispatch(fetchRestaurantAnalytics({ restaurantId: user?.restaurantId, period: newPeriod }));
                }}
                onRefresh={() => {
                  dispatch(fetchRestaurantAnalytics({ restaurantId: user?.restaurantId, period: analyticsPeriod }));
                }}
              />

              <Box sx={{ width: '100%' }}>
                {/* Row 1: Revenue Trends & Order Patterns */}
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <AreaChart
                      title="Revenue Trends"
                      data={analytics?.dailyRevenue || []}
                      dataKey="revenue"
                      xAxisKey="date"
                      color="#4caf50"
                      height={400}
                      formatXAxis={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      formatYAxis={(value) => `₹${value.toLocaleString()}`}
                      formatTooltip={(value, name) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      gradientId="revenueGradient"
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <BarChart
                      title="Hourly Order Patterns"
                      data={analytics?.hourlyOrders || []}
                      dataKey="orderCount"
                      xAxisKey="hour"
                      color="#2196f3"
                      height={400}
                      formatXAxis={(value) => `${value}:00`}
                      formatYAxis={(value) => value}
                      formatTooltip={(value, name) => [`${value} orders`, 'Orders']}
                    />
                  </Box>
                </Box>

                {/* Row 2: Popular Items & Order Status Distribution */}
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <BarChart
                    title="Popular Items"
                      data={(analytics?.popularItems || []).slice(0, 10).map(item => ({
                        name: item.itemName || item.name,
                        orders: item.orderCount || item.count || 0,
                        revenue: item.revenue || 0
                      }))}
                      dataKey="orders"
                      xAxisKey="name"
                      color="#ff9800"
                      height={400}
                      formatXAxis={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                      formatYAxis={(value) => value}
                      formatTooltip={(value, name, props) => [
                        `${value} orders`, 
                        'Orders',
                        `Revenue: ₹${props.payload?.revenue?.toLocaleString() || 0}`
                      ]}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <PieChart
                    title="Order Status Distribution"
                      data={(analytics?.orderStatusDistribution || []).map(status => ({
                        name: (status.status || status.label || '').toString().replace('_', ' '),
                        value: status.count || status.value || 0,
                        percentage: status.percentage || 0
                      }))}
                      dataKey="value"
                      nameKey="name"
                      height={400}
                      formatTooltip={(value, name, props) => [
                        `${value} orders (${props.payload?.percentage?.toFixed(1) || 0}%)`, 
                        name
                      ]}
                      colors={['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#00bcd4']}
                    />
                  </Box>
                </Box>

                {/* Row 3: Rating Distribution & Performance Metrics */}
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <BarChart
                      title="Rating Distribution"
                      data={(analytics?.ratingDistribution || []).map(rating => ({
                        name: `${rating.rating} ⭐`,
                        count: rating.count || 0,
                        percentage: rating.percentage || 0
                      }))}
                      dataKey="count"
                      xAxisKey="name"
                      color="#ffc107"
                      height={400}
                      formatXAxis={(value) => value}
                      formatYAxis={(value) => value}
                      formatTooltip={(value, name, props) => [
                        `${value} reviews (${props.payload?.percentage?.toFixed(1) || 0}%)`, 
                        'Reviews'
                      ]}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <BarChart
                      title="Performance Metrics"
                      data={[
                        { name: 'Completion Rate', value: analytics?.completionRate || 0, color: '#4caf50' },
                        { name: 'Cancellation Rate', value: analytics?.cancellationRate || 0, color: '#f44336' },
                        { name: 'On-Time Delivery', value: analytics?.onTimeDeliveryRate || 0, color: '#2196f3' }
                      ]}
                      dataKey="value"
                      xAxisKey="name"
                      color="#6c757d"
                      height={400}
                      formatXAxis={(value) => value.replace(' Rate', '')}
                      formatYAxis={(value) => `${value.toFixed(1)}%`}
                      formatTooltip={(value, name, props) => [`${value.toFixed(1)}%`, props.payload?.name || name]}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Order Details Modal */}
        <Modal
          open={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={selectedOrder ? `Order ${selectedOrder.id}` : 'Order'}
          maxWidth="md"
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {selectedOrder.customerName || selectedOrder.customer?.name || `Customer ${selectedOrder.userId}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {selectedOrder.deliveryAddress || selectedOrder.address || selectedOrder.delivery?.address || '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip 
                    label={`Payment: ${(selectedOrder.paymentStatus || 'PENDING').replace('_',' ')}`} 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 500,
                      borderColor: selectedOrder.paymentStatus === 'PAID' || selectedOrder.paymentStatus === 'COMPLETED' ? '#28a745' : 
                                 selectedOrder.paymentStatus === 'FAILED' ? '#dc3545' : 
                                 selectedOrder.paymentStatus === 'PENDING' ? '#ffc107' : '#6c757d',
                      color: selectedOrder.paymentStatus === 'PAID' || selectedOrder.paymentStatus === 'COMPLETED' ? '#28a745' : 
                             selectedOrder.paymentStatus === 'FAILED' ? '#dc3545' : 
                             selectedOrder.paymentStatus === 'PENDING' ? '#ffc107' : '#6c757d',
                      fontSize: '12px'
                    }} 
                  />
                  <Chip 
                    label={`Order: ${(selectedOrder.orderStatus || 'Unknown').replace('_',' ')}`} 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '12px',
                      borderColor: selectedOrder.orderStatus === 'PENDING' ? '#6c757d' :
                                  selectedOrder.orderStatus === 'ACCEPTED' ? '#28a745' :
                                  selectedOrder.orderStatus === 'PREPARING' ? '#fd7e14' :
                                  selectedOrder.orderStatus === 'READY_FOR_PICKUP' ? '#6f42c1' :
                                  selectedOrder.orderStatus === 'OUT_FOR_DELIVERY' ? '#20c997' :
                                  selectedOrder.orderStatus === 'DELIVERED' ? '#28a745' :
                                  selectedOrder.orderStatus === 'CANCELLED' ? '#dc3545' :
                                  selectedOrder.orderStatus === 'REJECTED' ? '#dc3545' : '#6c757d',
                      color: selectedOrder.orderStatus === 'PENDING' ? '#6c757d' :
                             selectedOrder.orderStatus === 'ACCEPTED' ? '#28a745' :
                             selectedOrder.orderStatus === 'PREPARING' ? '#fd7e14' :
                             selectedOrder.orderStatus === 'READY_FOR_PICKUP' ? '#6f42c1' :
                             selectedOrder.orderStatus === 'OUT_FOR_DELIVERY' ? '#20c997' :
                             selectedOrder.orderStatus === 'DELIVERED' ? '#28a745' :
                             selectedOrder.orderStatus === 'CANCELLED' ? '#dc3545' :
                             selectedOrder.orderStatus === 'REJECTED' ? '#dc3545' : '#6c757d'
                    }} 
                  />
                </Box>
              </Box>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Items</Typography>
              <Stack spacing={1}>
                {selectedOrder.items?.map((it, idx) => {
                  const itemId = it.menuItemId ?? it.itemId ?? it.id;
                  const info = menuItemIndex[itemId] || {};
                  return (
                    <Paper key={idx} sx={{ p: 1.5, border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 1, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                        {info.imageUrl ? (
                          <img src={info.imageUrl} alt={it.name || info.name || 'Item'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>No Image</Box>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{it.quantity || it.qty || 1}x {it.name || info.name || `#${itemId}`}</Typography>
                          <Typography variant="caption" sx={{ color: '#777' }}>
                          Item ID: {itemId}
                          </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ₹{Number((it.lineTotal ?? it.total ?? (it.price ?? it.unitPrice ?? 0) * (it.quantity || it.qty || 1))).toFixed(2)}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
              <Divider />
              <Box sx={{ 
                mt: 2, 
                p: 2.5, 
                border: '1px solid #f0f0f0', 
                borderRadius: '3px', 
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 1.5,
                  background: 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
                  borderRadius: '3px',
                  color: 'white'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    ₹{Number(selectedOrder.totalAmount ?? selectedOrder.total ?? 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
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
                        <TextField 
                          label="Item Name *" 
                          fullWidth 
                          value={editingItem.name} 
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} 
                        />
                        <TextField 
                          label="Preparation Time (minutes)" 
                          type="number" 
                          fullWidth 
                          value={editingItem.preparationTime} 
                          onChange={(e) => setEditingItem({ ...editingItem, preparationTime: Number(e.target.value) })} 
                        />
                        <TextField 
                          label="Description" 
                          fullWidth 
                          multiline 
                          rows={3} 
                          value={editingItem.description} 
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} 
                        />
                        <TextField 
                          label="Image URL" 
                          fullWidth 
                          value={editingItem.imageUrl} 
                          onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })} 
                        />
              </Stack>
                </Paper>

                {/* Pricing */}
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>Pricing</Typography>
                  <Stack spacing={2}>
                        <TextField 
                          label="Current Price (₹) *" 
                          type="number" 
                          step="0.01"
                          fullWidth 
                          value={editingItem.price} 
                          onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} 
                        />
                        <TextField 
                          label="Original Price (₹)" 
                          type="number" 
                          step="0.01"
                          fullWidth 
                          value={editingItem.originalPrice} 
                          onChange={(e) => setEditingItem({ ...editingItem, originalPrice: Number(e.target.value) })} 
                        />
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
                        <TextField 
                          label="Calories" 
                          type="number" 
                          fullWidth 
                          value={editingItem.nutrition?.calories ?? ''} 
                          onChange={(e) => {
                            const next = { ...(editingItem.nutrition || {}) };
                            next.calories = e.target.value;
                            setEditingItem({ ...editingItem, nutrition: next });
                          }} 
                        />
                        <TextField 
                          label="Protein (g)" 
                          type="number" 
                          step="0.1"
                          fullWidth 
                          value={editingItem.nutrition?.protein ?? ''} 
                          onChange={(e) => {
                            const next = { ...(editingItem.nutrition || {}) };
                            next.protein = e.target.value;
                            setEditingItem({ ...editingItem, nutrition: next });
                          }} 
                        />
                        <TextField 
                          label="Carbs (g)" 
                          type="number" 
                          step="0.1"
                          fullWidth 
                          value={editingItem.nutrition?.carbs ?? ''} 
                          onChange={(e) => {
                            const next = { ...(editingItem.nutrition || {}) };
                            next.carbs = e.target.value;
                            setEditingItem({ ...editingItem, nutrition: next });
                          }} 
                        />
                        <TextField 
                          label="Fat (g)" 
                          type="number" 
                          step="0.1"
                          fullWidth 
                          value={editingItem.nutrition?.fat ?? ''} 
                          onChange={(e) => {
                            const next = { ...(editingItem.nutrition || {}) };
                            next.fat = e.target.value;
                            setEditingItem({ ...editingItem, nutrition: next });
                          }} 
                        />
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

        {/* Unified Restaurant Form Modal for Edit */}
        <RestaurantFormModal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Edit Restaurant Profile"
          values={profileDraft}
          onChange={(patch) => setProfileDraft({ ...profileDraft, ...patch })}
          onSubmit={() => saveProfile()}
          submitLabel="Save Changes"
        />

        {/* Unified Restaurant Form Modal for Create */}
        <RestaurantFormModal
          open={showNewRestaurantModal}
          onClose={() => setShowNewRestaurantModal(false)}
          title="Add New Restaurant"
          values={newRestaurantData}
          onChange={(patch) => setNewRestaurantData({ ...newRestaurantData, ...patch })}
          onSubmit={() => handleCreateRestaurant()}
          submitLabel="Create Restaurant"
        />
      </Container>
    </Box>
  );
};

export default RestaurantDashboard;
