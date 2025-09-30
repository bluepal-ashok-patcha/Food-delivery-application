import React, { useMemo, useState } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, TextField, Stack, Button } from '@mui/material';
import { People, Restaurant, AttachMoney, LocalShipping } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import AdminHeader from '../../components/admin/AdminHeader';
import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import TabHeader from '../../components/admin/TabHeader';
import { useDispatch } from 'react-redux';
import { addUser, updateUser, deleteUser, addRestaurant, updateRestaurant, deleteRestaurant, updateOrderStatus, addPartner, updatePartner, deletePartner, setRestaurantActive, setRestaurantOpen, approveRestaurant, assignOrderToPartner, addCoupon, updateCoupon, deleteCoupon, activateUser, deactivateUser, rejectRestaurant } from '../../store/slices/adminSlice';
import UsersTable from '../../components/admin/UsersTable';
import RestaurantsTable from '../../components/admin/RestaurantsTable';
import OrdersTable from '../../components/admin/OrdersTable';
import DeliveryPartnersTable from '../../components/admin/DeliveryPartnersTable';
import Modal from '../../components/common/Modal';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openRestaurantModal, setOpenRestaurantModal] = useState(false);
  const [openPartnerModal, setOpenPartnerModal] = useState(false);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openCouponsModal, setOpenCouponsModal] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const { users, restaurants, orders, partners } = useSelector((state) => state.admin);
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const stats = useMemo(() => ([
    { 
      title: 'Total Users', 
      value: users?.length || 0, 
      icon: <People />, 
      color: '#fc8019',
      change: `${Math.min(99, Math.round(((orders?.length || 0) + (restaurants?.length || 0)) / 10))}%`,
      trend: 'up',
      subtitle: 'Active users'
    },
    { 
      title: 'Restaurants', 
      value: restaurants?.length || 0, 
      icon: <Restaurant />, 
      color: '#fc8019',
      change: `${Math.min(99, Math.round(((orders?.length || 0)) / 5))}%`,
      trend: 'up',
      subtitle: 'Partner restaurants'
    },
    { 
      title: 'Total Orders', 
      value: orders?.length || 0, 
      icon: <AttachMoney />, 
      color: '#fc8019',
      change: `${Math.min(99, Math.round(((orders?.length || 0)) * 3))}%`,
      trend: 'up',
      subtitle: 'This month'
    },
    { 
      title: 'Delivery Partners', 
      value: partners?.length || 0, 
      icon: <LocalShipping />, 
      color: '#fc8019',
      change: `${Math.min(99, Math.round(((partners?.length || 0)) * 2))}%`,
      trend: 'up',
      subtitle: 'Active partners'
    },
  ]), [users, restaurants, orders, partners]);

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

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
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
                onAddClick={() => { setFormValues({ name: '', email: '', phone: '' }); setOpenUserModal(true); }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField 
                  label="Search users"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField 
                  select 
                  label="Role"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">All roles</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner</option>
                </TextField>
              </Stack>
              <UsersTable 
                users={users.filter(u => {
                  const matchesSearch = userSearch ? (
                    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                    (u.phone || '').toLowerCase().includes(userSearch.toLowerCase())
                  ) : true;
                  const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
                  return matchesSearch && matchesRole;
                })}
                onViewUser={() => {}}
                onEditUser={(user) => { setFormValues(user); setOpenUserModal(true); }}
                onDeleteUser={(user) => dispatch(deleteUser(user.id))}
                onToggleActive={(user) => dispatch((user.isActive ? deactivateUser : activateUser)(user.id))}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Restaurant Management" 
                subtitle="Manage partner restaurants and their details"
                addButtonText="Add Restaurant"
                onAddClick={() => { setFormValues({ name: '', cuisine: '', address: '', ownerId: '' }); setOpenRestaurantModal(true); }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField 
                  select 
                  label="Filter"
                  value={restaurantFilter}
                  onChange={(e) => setRestaurantFilter(e.target.value)}
                  sx={{ minWidth: 220 }}
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                </TextField>
              </Stack>
              <RestaurantsTable 
                restaurants={restaurants.filter(r => restaurantFilter === 'ALL' ? true : (restaurantFilter === 'PENDING' ? !r.isApproved : r.isApproved))}
                onViewRestaurant={() => {}}
                onEditRestaurant={(r) => { setFormValues(r); setOpenRestaurantModal(true); }}
                onDeleteRestaurant={(r) => dispatch(deleteRestaurant(r.id))}
                onToggleActive={(r) => dispatch(setRestaurantActive({ id: r.id, isActive: !r.isActive }))}
                onToggleOpen={(r) => dispatch(setRestaurantOpen({ id: r.id, isOpen: !r.isOpen }))}
                onApprove={(r) => dispatch(approveRestaurant(r.id))}
                onReject={(r) => dispatch(rejectRestaurant(r.id))}
              />
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Order Management" 
                subtitle="Monitor and manage all platform orders"
                showAddButton={false}
              />
              <OrdersTable 
                orders={orders} 
                getStatusColor={getStatusColor}
                onViewOrder={(o) => { setFormValues({ ...o }); setOpenOrderModal(true); }}
                onUpdateStatus={(o) => { setFormValues(o); setOpenOrderModal(true); }}
              />
            </Box>
          )}

          {tabValue === 3 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Delivery Partner Management" 
                subtitle="Manage delivery partners and their performance"
                addButtonText="Add Partner"
                onAddClick={() => { setFormValues({ name: '', phone: '', vehicleType: 'Bike' }); setOpenPartnerModal(true); }}
              />
              <DeliveryPartnersTable 
                partners={partners}
                onViewPartner={() => {}}
                onEditPartner={(p) => { setFormValues(p); setOpenPartnerModal(true); }}
                onDeletePartner={(p) => dispatch(deletePartner(p.id))}
              />
            </Box>
          )}
        </Paper>

        {/* Order Status & Assignment / View Modal */}
        <Modal 
          open={openOrderModal}
          onClose={() => setOpenOrderModal(false)}
          title={'Order Details'}
          actions={
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setOpenOrderModal(false)} variant="outlined">Cancel</Button>
              <Button 
                variant="contained" 
                sx={{ background: '#fc8019' }}
                onClick={() => {
                  if (formValues?.id) {
                    if (formValues.status) dispatch(updateOrderStatus({ id: formValues.id, status: formValues.status }));
                    if (formValues.deliveryPartnerId) dispatch(assignOrderToPartner({ orderId: formValues.id, partnerId: formValues.deliveryPartnerId }));
                  }
                  setOpenOrderModal(false);
                }}
              >
                Save
              </Button>
            </Stack>
          }
        >
          <Stack spacing={2}>
            {/* Items with images */}
            {Array.isArray(formValues.items) && formValues.items.length > 0 && (
              <Stack spacing={1}>
                {formValues.items.map((it) => (
                  <Box key={it.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img src={it.image || 'https://via.placeholder.com/48'} alt={it.name} width={48} height={48} style={{ borderRadius: 4, objectFit: 'cover' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{it.name} × {it.quantity}</span>
                      <span>${Number(it.price * it.quantity).toFixed(2)}</span>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
            {/* Totals */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>${Number(formValues.subtotal || 0).toFixed(2)}</span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery</span>
              <span>${Number(formValues.deliveryFee || 0).toFixed(2)}</span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span>
              <span>${Number(formValues.total || 0).toFixed(2)}</span>
            </Box>
            <TextField 
              select 
              label="Status" 
              value={formValues.status || ''}
              onChange={(e) => setFormValues(v => ({ ...v, status: e.target.value }))}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="picked_up">Picked Up</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </TextField>
            <TextField 
              select 
              label="Assign Partner" 
              value={formValues.deliveryPartnerId || ''}
              onChange={(e) => setFormValues(v => ({ ...v, deliveryPartnerId: e.target.value }))}
              fullWidth
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">Unassigned</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </TextField>
          </Stack>
        </Modal>

        {/* Coupons Modal */}
        <Modal 
          open={openCouponsModal}
          onClose={() => setOpenCouponsModal(false)}
          title={'Manage Coupons'}
          actions={
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setOpenCouponsModal(false)} variant="outlined">Close</Button>
            </Stack>
          }
        >
          <Stack spacing={2}>
            <TextField label="Code" value={formValues.code || ''} onChange={(e) => setFormValues(v => ({ ...v, code: e.target.value }))} fullWidth />
            <TextField label="Description" value={formValues.description || ''} onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value }))} fullWidth />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => dispatch(addCoupon({ code: formValues.code, description: formValues.description, discountType: 'percentage', discountValue: 10, isActive: true }))}>Add</Button>
            </Stack>
          </Stack>
        </Modal>

        {/* Transactions view removed per request */}

        {/* User Modal */}
        <Modal 
          open={openUserModal}
          onClose={() => setOpenUserModal(false)}
          title={formValues?.id ? 'Edit User' : 'Add User'}
          actions={
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setOpenUserModal(false)} variant="outlined">Cancel</Button>
              <Button 
                variant="contained" 
                sx={{ background: '#fc8019' }}
                onClick={() => {
                  if (formValues?.id) {
                    dispatch(updateUser({ id: formValues.id, changes: { name: formValues.name, email: formValues.email, phone: formValues.phone, role: formValues.role } }));
                  } else {
                    dispatch(addUser({ name: formValues.name, email: formValues.email, phone: formValues.phone, role: formValues.role || 'CUSTOMER' }));
                  }
                  setOpenUserModal(false);
                }}
              >
                Save
              </Button>
            </Stack>
          }
        >
          <Stack spacing={2}>
            <TextField label="Name" value={formValues.name || ''} onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))} fullWidth />
            <TextField label="Email" value={formValues.email || ''} onChange={(e) => setFormValues(v => ({ ...v, email: e.target.value }))} fullWidth />
            <TextField label="Phone" value={formValues.phone || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} fullWidth />
            <TextField 
              select 
              label="Role"
              value={formValues.role || 'CUSTOMER'}
              onChange={(e) => setFormValues(v => ({ ...v, role: e.target.value }))}
              fullWidth
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="RESTAURANT_OWNER">Restaurant Owner</option>
              <option value="DELIVERY_PARTNER">Delivery Partner</option>
            </TextField>
          </Stack>
        </Modal>

        {/* Restaurant Modal */}
        <Modal 
          open={openRestaurantModal}
          onClose={() => setOpenRestaurantModal(false)}
          title={formValues?.id ? 'Edit Restaurant' : 'Add Restaurant'}
          actions={
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setOpenRestaurantModal(false)} variant="outlined">Cancel</Button>
              <Button 
                variant="contained" 
                sx={{ background: '#fc8019' }}
                onClick={() => {
                  if (formValues?.id) {
                    dispatch(updateRestaurant({ id: formValues.id, changes: { name: formValues.name, cuisine: formValues.cuisine, address: formValues.address, isActive: formValues.isActive, isOpen: formValues.isOpen, isApproved: formValues.isApproved, ownerId: formValues.ownerId } }));
                  } else {
                    dispatch(addRestaurant({ name: formValues.name, cuisine: formValues.cuisine, address: formValues.address, isActive: true, isOpen: true, ownerId: formValues.ownerId }));
                  }
                  setOpenRestaurantModal(false);
                }}
              >
                Save
              </Button>
            </Stack>
          }
        >
          <Stack spacing={2}>
            <TextField label="Name" value={formValues.name || ''} onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))} fullWidth />
            <TextField label="Cuisine" value={formValues.cuisine || ''} onChange={(e) => setFormValues(v => ({ ...v, cuisine: e.target.value }))} fullWidth />
            <TextField label="Address" value={formValues.address || ''} onChange={(e) => setFormValues(v => ({ ...v, address: e.target.value }))} fullWidth />
            <TextField 
              select 
              label="Owner"
              value={formValues.ownerId || ''}
              onChange={(e) => setFormValues(v => ({ ...v, ownerId: e.target.value }))}
              fullWidth
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">Select owner</option>
              {users.filter(u => u.role === 'RESTAURANT_OWNER').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </TextField>
            <TextField 
              select 
              label="Status"
              value={(formValues.isApproved ? 'APPROVED' : (formValues.isActive ? 'ACTIVE' : 'INACTIVE'))}
              onChange={(e) => {
                const val = e.target.value;
                setFormValues(v => ({ 
                  ...v, 
                  isApproved: val === 'APPROVED' ? true : v.isApproved,
                  isActive: val === 'ACTIVE' ? true : val === 'INACTIVE' ? false : v.isActive
                }));
              }}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="APPROVED">Approved</option>
            </TextField>
            <TextField 
              select 
              label="Open/Closed"
              value={formValues.isOpen ? 'OPEN' : 'CLOSED'}
              onChange={(e) => setFormValues(v => ({ ...v, isOpen: e.target.value === 'OPEN' }))}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </TextField>
          </Stack>
        </Modal>

        {/* Partner Modal */}
        <Modal 
          open={openPartnerModal}
          onClose={() => setOpenPartnerModal(false)}
          title={formValues?.id ? 'Edit Partner' : 'Add Partner'}
          actions={
            <Stack direction="row" spacing={2}>
              <Button onClick={() => setOpenPartnerModal(false)} variant="outlined">Cancel</Button>
              <Button 
                variant="contained" 
                sx={{ background: '#fc8019' }}
                onClick={() => {
                  if (formValues?.id) {
                    dispatch(updatePartner({ id: formValues.id, changes: { name: formValues.name, phone: formValues.phone, vehicleType: formValues.vehicleType } }));
                  } else {
                    dispatch(addPartner({ name: formValues.name, phone: formValues.phone, vehicleType: formValues.vehicleType }));
                  }
                  setOpenPartnerModal(false);
                }}
              >
                Save
              </Button>
            </Stack>
          }
        >
          <Stack spacing={2}>
            <TextField label="Name" value={formValues.name || ''} onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))} fullWidth />
            <TextField label="Phone" value={formValues.phone || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} fullWidth />
            <TextField label="Vehicle Type" value={formValues.vehicleType || ''} onChange={(e) => setFormValues(v => ({ ...v, vehicleType: e.target.value }))} fullWidth />
          </Stack>
        </Modal>
      </Container>
    </Box>
  );
};

export default AdminDashboard;