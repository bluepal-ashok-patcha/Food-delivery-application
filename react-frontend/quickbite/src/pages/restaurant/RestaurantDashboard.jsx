import React, { useMemo, useState } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, Typography, Stack, Chip, Divider, Button } from '@mui/material';
import { Restaurant, AttachMoney, AccessTime, Star } from '@mui/icons-material';
import { mockOrders, mockRestaurants } from '../../constants/mockData';
import RestaurantHeader from '../../components/restaurant/RestaurantHeader';
import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import TabHeader from '../../components/admin/TabHeader';
import RestaurantOrdersTable from '../../components/restaurant/RestaurantOrdersTable';
import MenuCard from '../../components/restaurant/MenuCard';
import AnalyticsCard from '../../components/restaurant/AnalyticsCard';
import Modal from '../../components/common/Modal';
import TextField from '../../components/common/TextField';

const RestaurantDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [orders, setOrders] = useState(() => [...mockOrders]);
  const [restaurantsState, setRestaurantsState] = useState(() => JSON.parse(JSON.stringify(mockRestaurants)));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showRecentOrdersModal, setShowRecentOrdersModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState(() => ({
    name: restaurantsState[0]?.name || '',
    phone: restaurantsState[0]?.phone || '',
    address: restaurantsState[0]?.address || '',
    openingHours: restaurantsState[0]?.openingHours || '',
    deliveryRadiusKm: restaurantsState[0]?.deliveryRadiusKm || 5,
    image: restaurantsState[0]?.image || '',
    coverImage: restaurantsState[0]?.coverImage || ''
  }));
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleStatus = () => {
    setIsOpen(!isOpen);
  };

  const restaurantOrders = useMemo(() => orders.filter(order => order.restaurantId === 1), [orders]);
  const todayOrders = restaurantOrders.filter(order => 
    new Date(order.orderDate).toDateString() === new Date().toDateString()
  );
  const upcomingOrders = restaurantOrders.filter(o => ['placed','preparing'].includes(o.status));
  const menuItemIndex = useMemo(() => {
    const idx = {};
    const r = restaurantsState[0];
    (r?.menu || []).forEach(c => (c.items || []).forEach(i => { idx[i.id] = i; }));
    return idx;
  }, [restaurantsState]);

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
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      if (action === 'accept' && o.status === 'placed') return { ...o, status: 'preparing' };
      if (action === 'reject' && o.status === 'placed') return { ...o, status: 'cancelled' };
      if (action === 'ready' && o.status === 'preparing') return { ...o, status: 'ready_for_pickup' };
      return o;
    }));
  };

  const handleOrderRowClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleMenuAddClick = () => {
    setEditingItem({ id: null, name: '', description: '', price: '', originalPrice: '', image: '', isVeg: true, isPopular: false, isAvailable: true, preparationTime: 10, nutrition: { calories: '', protein: '', carbs: '', fat: '' } });
    setCurrentCategoryId(restaurantsState[0]?.menu?.[0]?.id || null);
    setShowItemModal(true);
  };

  const handleMenuEdit = (item, categoryId) => {
    setEditingItem({ ...item });
    setCurrentCategoryId(categoryId);
    setShowItemModal(true);
  };

  const saveMenuItem = () => {
    setRestaurantsState(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const restaurant = copy[0];
      if (!restaurant?.menu) return prev;
      const category = restaurant.menu.find(c => c.id === currentCategoryId) || restaurant.menu[0];
      if (!category) return prev;
      if (editingItem.id) {
        category.items = category.items.map(it => it.id === editingItem.id ? {
          ...editingItem,
          price: Number(editingItem.price) || 0,
          originalPrice: editingItem.originalPrice !== '' ? Number(editingItem.originalPrice) : undefined,
          preparationTime: editingItem.preparationTime !== '' ? Number(editingItem.preparationTime) : undefined,
          isPopular: Boolean(editingItem.isPopular),
          nutrition: editingItem.nutrition ? {
            calories: editingItem.nutrition.calories !== '' ? Number(editingItem.nutrition.calories) : undefined,
            protein: editingItem.nutrition.protein !== '' ? Number(editingItem.nutrition.protein) : undefined,
            carbs: editingItem.nutrition.carbs !== '' ? Number(editingItem.nutrition.carbs) : undefined,
            fat: editingItem.nutrition.fat !== '' ? Number(editingItem.nutrition.fat) : undefined,
          } : undefined
        } : it);
      } else {
        const newId = Math.max(0, ...restaurant.menu.flatMap(c => c.items.map(i => i.id))) + 1;
        category.items.push({
          ...editingItem,
          id: newId,
          price: Number(editingItem.price) || 0,
          originalPrice: editingItem.originalPrice !== '' ? Number(editingItem.originalPrice) : undefined,
          preparationTime: editingItem.preparationTime !== '' ? Number(editingItem.preparationTime) : undefined,
          isPopular: Boolean(editingItem.isPopular),
          nutrition: editingItem.nutrition ? {
            calories: editingItem.nutrition.calories !== '' ? Number(editingItem.nutrition.calories) : undefined,
            protein: editingItem.nutrition.protein !== '' ? Number(editingItem.nutrition.protein) : undefined,
            carbs: editingItem.nutrition.carbs !== '' ? Number(editingItem.nutrition.carbs) : undefined,
            fat: editingItem.nutrition.fat !== '' ? Number(editingItem.nutrition.fat) : undefined,
          } : undefined
        });
      }
      return copy;
    });
    setShowItemModal(false);
    setEditingItem(null);
  };

  const removeMenuItem = () => {
    if (!editingItem?.id) return;
    setRestaurantsState(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const restaurant = copy[0];
      restaurant.menu.forEach(c => {
        c.items = c.items.filter(i => i.id !== editingItem.id);
      });
      return copy;
    });
    setShowItemModal(false);
    setEditingItem(null);
  };

  const saveProfile = () => {
    setRestaurantsState(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[0] = { ...copy[0], ...profileDraft };
      return copy;
    });
    setShowProfileModal(false);
  };

  const manageCategories = (action, payload) => {
    setRestaurantsState(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const restaurant = copy[0];
      if (!restaurant.menu) restaurant.menu = [];
      if (action === 'add') {
        const newId = Math.max(0, ...restaurant.menu.map(c => c.id)) + 1;
        restaurant.menu.push({ id: newId, category: payload || 'New Category', items: [] });
      } else if (action === 'rename') {
        const cat = restaurant.menu.find(c => c.id === payload.id);
        if (cat) cat.category = payload.name;
      } else if (action === 'remove') {
        restaurant.menu = restaurant.menu.filter(c => c.id !== payload);
      }
      return copy;
    });
  };

  return (
    <Box sx={{ 
      background: '#f5f5f5',
      minHeight: '100vh',
      py: 3
    }}>
      <Container maxWidth="xl">
        <RestaurantHeader isOpen={isOpen} onToggleStatus={handleToggleStatus} onEditProfile={() => setShowProfileModal(true)} onOpenRecentOrders={() => setShowRecentOrdersModal(true)} />

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
              <RestaurantOrdersTable orders={restaurantOrders} onOrderAction={handleOrderAction} onRowClick={handleOrderRowClick} />
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
              
              <Grid container spacing={3}>
                {restaurantsState && restaurantsState.length > 0 && restaurantsState[0].menu ? (
                  restaurantsState[0].menu.map((category) => (
                    <Grid item xs={12} key={category.id}>
                      <Paper sx={{ 
                        p: 3,
                        borderRadius: '4px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        background: '#fff'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                          {category.category}
                        </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" onClick={() => { setShowCategoriesModal(true); setCurrentCategoryId(category.id); }} sx={{ textTransform: 'none' }}>Manage Categories</Button>
                          </Stack>
                        </Box>
                        <Grid container spacing={3}>
                          {category.items && category.items.map((item) => (
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

        {/* Order Details Modal */}
        <Modal
          open={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={selectedOrder ? `Order #${selectedOrder.id}` : 'Order'}
          maxWidth="sm"
          fullWidth
          actions={
            <Stack direction="row" spacing={1}>
              {selectedOrder?.status === 'placed' && (
                <>
                  <Button variant="contained" onClick={() => { handleOrderAction(selectedOrder.id, 'accept'); setShowOrderModal(false); }} sx={{ background: '#4caf50' }}>Accept</Button>
                  <Button variant="outlined" onClick={() => { handleOrderAction(selectedOrder.id, 'reject'); setShowOrderModal(false); }} sx={{ borderColor: '#f44336', color: '#f44336' }}>Reject</Button>
                </>
              )}
              {selectedOrder?.status === 'preparing' && (
                <Button variant="contained" onClick={() => { handleOrderAction(selectedOrder.id, 'ready'); setShowOrderModal(false); }} sx={{ background: '#fc8019' }}>Mark Ready</Button>
              )}
              {/* Removed Out for delivery per requirement */}
              <Button onClick={() => setShowOrderModal(false)}>Close</Button>
            </Stack>
          }
        >
          {selectedOrder && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>Customer #{selectedOrder.customerId}</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>{selectedOrder.deliveryAddress}</Typography>
                </Box>
                <Chip label={selectedOrder.status.replace('_',' ')} sx={{ fontWeight: 700 }} />
              </Box>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Items</Typography>
              <Stack spacing={1}>
                {selectedOrder.items.map((it, idx) => {
                  const info = menuItemIndex[it.id] || {};
                  return (
                    <Paper key={idx} sx={{ p: 1.5, border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 1, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                        {info.image ? (
                          <img src={info.image} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>No Image</Box>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{it.quantity}x {it.name}</Typography>
                        {it.customization && (
                          <Typography variant="caption" sx={{ color: '#777' }}>
                            {Object.entries(it.customization).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ${Number((it.price || info.price || 0) * it.quantity).toFixed(2)}
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
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(selectedOrder.subtotal || 0).toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Delivery</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(selectedOrder.deliveryFee || 0).toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tax</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(selectedOrder.tax || 0).toFixed(2)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Total</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>${Number(selectedOrder.total || 0).toFixed(2)}</Typography>
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
          maxWidth="sm"
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
            <Stack spacing={2}>
              <TextField 
                select 
                label="Category" 
                fullWidth 
                value={currentCategoryId || ''} 
                onChange={(e) => setCurrentCategoryId(e.target.value)}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                {(restaurantsState[0]?.menu || []).map(c => (
                  <option key={c.id} value={c.id}>{c.category}</option>
                ))}
              </TextField>
              <TextField label="Name" fullWidth value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
              <TextField label="Description" fullWidth multiline rows={3} value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
              <TextField label="Price" type="number" fullWidth value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} />
              <TextField label="Original Price" type="number" fullWidth value={editingItem.originalPrice} onChange={(e) => setEditingItem({ ...editingItem, originalPrice: e.target.value })} />
              <TextField label="Image URL" fullWidth value={editingItem.image} onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })} />
              <TextField label="Preparation Time (min)" type="number" fullWidth value={editingItem.preparationTime} onChange={(e) => setEditingItem({ ...editingItem, preparationTime: e.target.value })} />
              <Stack direction="row" spacing={1}>
                <Button variant={editingItem.isVeg ? 'contained' : 'outlined'} onClick={() => setEditingItem({ ...editingItem, isVeg: true })} sx={{ textTransform: 'none', ...(editingItem.isVeg ? { background: '#4caf50' } : {}) }}>Veg</Button>
                <Button variant={!editingItem.isVeg ? 'contained' : 'outlined'} onClick={() => setEditingItem({ ...editingItem, isVeg: false })} sx={{ textTransform: 'none', ...(!editingItem.isVeg ? { background: '#f44336' } : {}) }}>Non-Veg</Button>
                <Button variant={editingItem.isPopular ? 'contained' : 'outlined'} onClick={() => setEditingItem({ ...editingItem, isPopular: !editingItem.isPopular })} sx={{ textTransform: 'none' }}>{editingItem.isPopular ? 'Popular' : 'Mark Popular'}</Button>
                <Button variant={editingItem.isAvailable ? 'contained' : 'outlined'} onClick={() => setEditingItem({ ...editingItem, isAvailable: !editingItem.isAvailable })} sx={{ textTransform: 'none' }}>{editingItem.isAvailable ? 'Available' : 'Out of Stock'}</Button>
              </Stack>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Nutrition</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Calories" type="number" fullWidth value={editingItem.nutrition?.calories} onChange={(e) => setEditingItem({ ...editingItem, nutrition: { ...editingItem.nutrition, calories: e.target.value } })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Protein" type="number" fullWidth value={editingItem.nutrition?.protein} onChange={(e) => setEditingItem({ ...editingItem, nutrition: { ...editingItem.nutrition, protein: e.target.value } })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Carbs" type="number" fullWidth value={editingItem.nutrition?.carbs} onChange={(e) => setEditingItem({ ...editingItem, nutrition: { ...editingItem.nutrition, carbs: e.target.value } })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Fat" type="number" fullWidth value={editingItem.nutrition?.fat} onChange={(e) => setEditingItem({ ...editingItem, nutrition: { ...editingItem.nutrition, fat: e.target.value } })} />
                </Grid>
              </Grid>
            </Stack>
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
            {restaurantsState[0]?.menu?.map(c => (
              <Stack key={c.id} direction="row" spacing={1} alignItems="center">
                <TextField fullWidth value={c.category} onChange={(e) => manageCategories('rename', { id: c.id, name: e.target.value })} />
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
          maxWidth="sm"
          fullWidth
          actions={<Button variant="contained" onClick={saveProfile} sx={{ background: '#fc8019' }}>Save</Button>}
        >
          <Stack spacing={2}>
            <TextField label="Restaurant Name" fullWidth value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} />
            <TextField label="Phone" fullWidth value={profileDraft.phone} onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })} />
            <TextField label="Address" fullWidth multiline rows={2} value={profileDraft.address} onChange={(e) => setProfileDraft({ ...profileDraft, address: e.target.value })} />
            <TextField label="Business Hours" fullWidth value={profileDraft.openingHours} onChange={(e) => setProfileDraft({ ...profileDraft, openingHours: e.target.value })} />
            <TextField label="Delivery Radius (km)" type="number" fullWidth value={profileDraft.deliveryRadiusKm} onChange={(e) => setProfileDraft({ ...profileDraft, deliveryRadiusKm: Number(e.target.value) })} />
            <TextField label="Logo Image URL" fullWidth value={profileDraft.image} onChange={(e) => setProfileDraft({ ...profileDraft, image: e.target.value })} />
            <TextField label="Cover Image URL" fullWidth value={profileDraft.coverImage} onChange={(e) => setProfileDraft({ ...profileDraft, coverImage: e.target.value })} />
          </Stack>
        </Modal>
      </Container>
    </Box>
  );
};

export default RestaurantDashboard;
