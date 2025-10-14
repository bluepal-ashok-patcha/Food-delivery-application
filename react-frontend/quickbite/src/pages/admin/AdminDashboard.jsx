import React, { useMemo, useState, useEffect,useRef } from 'react';
import { Box, Container, Paper, Grid, Tabs, Tab, TextField, Stack, Button, CircularProgress, Alert, Chip, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider,RadioGroup, FormControlLabel, Radio  } from '@mui/material';
import { People, Restaurant, AttachMoney, LocalShipping, Analytics, Receipt, TrendingUp,UploadFile, FileDownload } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openMapModal } from '../../store/slices/locationSlice';
import AdminHeader from '../../components/admin/AdminHeader';
import { restaurantAPI,adminAPI } from '../../services/api';

import EnhancedStatCard from '../../components/admin/EnhancedStatCard';
import { LineChart, BarChart, PieChart, AreaChart, ChartControls } from '../../components/charts';

import TabHeader from '../../components/admin/TabHeader';

import { 
  fetchUsers, createUser, updateUser, toggleUserStatus,
  fetchRestaurants, fetchPendingRestaurants, approveRestaurant, rejectRestaurant, updateRestaurantStatus,
  createRestaurant, updateRestaurantProfile,
  fetchOrders, updateOrderStatus,
  fetchDeliveryPartners, fetchAllDeliveryPartners, approveDeliveryPartner, rejectDeliveryPartner,
  fetchCoupons, createCoupon, updateCoupon, deleteCoupon,
  fetchTransactions, fetchAnalytics,
    deleteUser, deleteRestaurant, assignOrderToPartner, deletePartner, addPartner, updatePartner, updateDeliveryPartnerProfile,
  setRestaurantOpenAsync, setRestaurantActiveAsync
} from '../../store/slices/adminSlice';
import UsersTable from '../../components/admin/UsersTable';

import RestaurantsTable from '../../components/admin/RestaurantsTable';

import OrdersTable from '../../components/admin/OrdersTable';

import DeliveryPartnersTable from '../../components/admin/DeliveryPartnersTable';

import Modal from '../../components/common/Modal';
import TransactionsTable from '../../components/admin/TransactionsTable';
import ActionButtons from '../../components/admin/ActionButtons';



const AdminDashboard = () => {

  const [tabValue, setTabValue] = useState(0);

  const dispatch = useDispatch();

   // NEW: refs & state for import/export
  const fileInputRef = useRef(null);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [exportType, setExportType] = useState('pdf'); // 'pdf' or 'excel'
  const [exportRole, setExportRole] = useState(''); // '' = all

  const [openUserModal, setOpenUserModal] = useState(false);

  const [openRestaurantModal, setOpenRestaurantModal] = useState(false);

  const [openPartnerModal, setOpenPartnerModal] = useState(false);

  const [openOrderModal, setOpenOrderModal] = useState(false);

  const [openCouponsModal, setOpenCouponsModal] = useState(false);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [formValues, setFormValues] = useState({});
  const { currentLocation, isGeocoding, selectedCoordinates } = useSelector((state) => state.location);
  const [pendingApplyMapLocation, setPendingApplyMapLocation] = useState(false);
  const [restaurantData, setRestaurantData] = useState({ name: 'Restaurant', image: null });
  useEffect(() => {
    if (pendingApplyMapLocation && !isGeocoding && (selectedCoordinates?.lat && selectedCoordinates?.lng || (currentLocation?.lat && currentLocation?.lng))) {
      const lat = selectedCoordinates?.lat ?? currentLocation.lat;
      const lng = selectedCoordinates?.lng ?? currentLocation.lng;
      setFormValues(v => ({ ...v, latitude: lat, longitude: lng, address: v.address || currentLocation.address }));
      setPendingApplyMapLocation(false);
    }
  }, [pendingApplyMapLocation, isGeocoding, currentLocation, selectedCoordinates]);

  const [userSearch, setUserSearch] = useState('');

  const [userRoleFilter, setUserRoleFilter] = useState('');

  const [restaurantFilter, setRestaurantFilter] = useState('ALL');

  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  
  const { 
    users, restaurants, orders, partners, coupons, transactions, analytics,
    loading, error, pagination 
  } = useSelector((state) => state.admin);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchUsers({ page: 0, size: 10 }));
    dispatch(fetchRestaurants({ page: 0, size: 10 }));
    dispatch(fetchOrders({ page: 0, size: 10 }));
    dispatch(fetchAllDeliveryPartners());
    dispatch(fetchCoupons({ page: 0, size: 10 }));
    dispatch(fetchTransactions());
    dispatch(fetchAnalytics({ type: 'order', period: analyticsPeriod }));
    // Also fetch delivery analytics for partner card
    dispatch(fetchAnalytics({ type: 'delivery', period: analyticsPeriod }));
  }, [dispatch, analyticsPeriod]);

  // Fetch restaurant data when order modal opens (like OrderCard does)
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        if (formValues.restaurantId && openOrderModal) {
          const res = await restaurantAPI.getRestaurantById(formValues.restaurantId);
          const data = res?.data || res;
          if (!cancel) {
            if (data?.name) setRestaurantData({ name: data.name, image: data.image });
          }
        }
      } catch (_) {
        // Keep default values if API fails
      }
    })();
    return () => { cancel = true; };
  }, [formValues.restaurantId, openOrderModal]);

  const handleTabChange = (event, newValue) => {

    setTabValue(newValue);

  };



  const stats = useMemo(() => {
    const totalUsers = pagination.users?.total || users?.length || 0;
    const totalRestaurants = pagination.restaurants?.total || restaurants?.length || 0;
    const totalOrders = pagination.orders?.total || orders?.length || 0;
    const totalPartners = partners?.length || 0;
    const totalTransactions = transactions?.length || 0;
    const totalCoupons = pagination.coupons?.total || coupons?.length || 0;
    // From delivery analytics summary payload
    const totalDeliveries = analytics?.delivery?.totalDeliveries || 0;
    const totalPartnersFromSummary = analytics?.delivery?.totalPartners || totalPartners;

    return [
    { 

      title: 'Total Users', 

        value: totalUsers, 
      icon: <People />, 

      color: '#fc8019',

        change: `${Math.min(99, Math.round(totalUsers / 10))}%`,
      trend: 'up',

        subtitle: 'Registered users'
    },

    { 

      title: 'Restaurants', 

        value: totalRestaurants, 
      icon: <Restaurant />, 

        color: '#4caf50',
        change: `${Math.min(99, Math.round(totalRestaurants / 5))}%`,
      trend: 'up',

      subtitle: 'Partner restaurants'

    },

    

    { 
      title: 'Delivery Partners', 
      value: totalPartnersFromSummary, 
      icon: <LocalShipping />, 
      color: '#ff9800',
      change: `${Math.min(99, Math.round((totalPartnersFromSummary || 0) / 3))}%`,
      trend: 'up',
      subtitle: 'Total partners'
    },

      { 
        title: 'Transactions', 
        value: totalTransactions, 
        icon: <Receipt />, 
        color: '#9c27b0',
        change: `${Math.min(99, Math.round(totalTransactions / 50))}%`,
        trend: 'up',
        subtitle: 'Payment transactions'
      },
      { 
        title: 'Coupons', 
        value: totalCoupons, 
        icon: <TrendingUp />, 
        color: '#f44336',
        change: `${Math.min(99, Math.round(totalCoupons / 2))}%`,
        trend: 'up',
        subtitle: 'Active coupons'
      },
    ];
  }, [users, restaurants, orders, partners, transactions, coupons, pagination]);


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

            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <EnhancedStatCard stat={stat} />

            </Grid>

          ))}

        </Grid>



        {/* Enhanced Tabs */}

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

            <Tab label="Users" />

            <Tab label="Restaurants" />

            <Tab label="Orders" />

            <Tab label="Delivery Partners" />

            <Tab label="Coupons" />
            <Tab label="Transactions" />
            <Tab label="Analytics" />
          </Tabs>

        </Paper>



        <Paper sx={{ 

          borderRadius: '3px',

          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',

          overflow: 'hidden'

        }}>

          {/* {tabValue === 0 && (

            <Box sx={{ p: 4 }}>

              <TabHeader 

                title="User Management" 

                subtitle="Manage platform users and their roles"

                addButtonText="Add User"

                onAddClick={() => { setFormValues({ name: '', email: '', phone: '', role: 'CUSTOMER' }); setOpenUserModal(true); }}
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

              
              {loading.users && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error.users && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.users}
                </Alert>
              )}
              
              {!loading.users && (
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

                  onToggleActive={(user) => dispatch(toggleUserStatus({ id: user.id, isActive: !user.isActive }))}
              />

              )}
            </Box>

          )} */}

           {tabValue === 0 && (

            <Box sx={{ p: 4 }}>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                {/* Keep TabHeader but hide its built-in add button so we render custom actions */}
                <Box sx={{ flex: 1 }}>
                  <TabHeader
                    title="User Management"
                    subtitle="Manage platform users and their roles"
                    showAddButton={false}
                  />
                </Box>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<UploadFile />}
                    onClick={() => setOpenImportModal(true)}
                    sx={{ background: '#fc8019', '&:hover': { background: '#e6730a' }, textTransform: 'none' }}
                  >
                    Import
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    onClick={() => setOpenExportModal(true)}
                    sx={{ background: '#fc8019', '&:hover': { background: '#e6730a' }, textTransform: 'none' }}
                  >
                    Export
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => { setFormValues({ name: '', email: '', phone: '', role: 'CUSTOMER' }); setOpenUserModal(true); }}
                    sx={{ background: '#fc8019', '&:hover': { background: '#e6730a' }, textTransform: 'none' }}
                  >
                   Add User 
                  </Button>
                </Stack>
              </Box>

              {/* Hidden file input for import */}
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                try {
                  // Prefer adminAPI.importUsers if present, otherwise POST directly
                  if (adminAPI?.importUsers) {
                    await adminAPI.importUsers(file);
                  } else {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/admin/users/import`, {
                      method: 'POST',
                      body: formData,
                      credentials: 'include'
                    }); 
                    if (!res.ok) throw new Error('Import failed');
                  }
                  alert('Import successful');
                  dispatch(fetchUsers({ page: 0, size: 10 }));
                } catch (err) {
                  alert('Import failed: ' + (err?.message || err));
                } finally {
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setOpenImportModal(false);
                }
              }} />

              {/* IMPORT Modal */}
              <Modal
                open={openImportModal}
                onClose={() => setOpenImportModal(false)}
                title="Import Users"
                actions={
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        try {
                          const blob = await adminAPI.downloadUserTemplate();
                          const url = window.URL.createObjectURL(new Blob([blob]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'user_import_template.xlsx');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          // fallback to local public template if backend not available
                          window.open('/templates/users-template.xlsx', '_blank');
                        }
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Download Template
                    </Button>

                    <Button variant="contained" onClick={() => fileInputRef.current?.click()} sx={{ background: '#fc8019', '&:hover': { background: '#e6730a' }, textTransform: 'none' }}>
                      Import File
                    </Button>
                  </Stack>
                }
              >
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">Use the template to prepare your file. Headers expected: name,email,phone,role,isActive</Typography>
                  <Typography variant="caption" color="text.secondary">Supported formats: .xlsx, .xls, .csv</Typography>
                </Stack>
              </Modal>

              {/* EXPORT Modal */}
              <Modal
                open={openExportModal}
                onClose={() => setOpenExportModal(false)}
                title="Export Users"
                actions={
                  <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={() => setOpenExportModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={async () => {
                      try {
                        let blob = null;
                        if (exportType === 'pdf') {
                          if (exportRole) {
                            blob = await adminAPI.exportUsersByRole(exportRole);
                          } else {
                            blob = await adminAPI.exportUsersToPdf();
                          }
                          const filename = exportRole ? `users_${exportRole}_export.pdf` : 'users_export.pdf';
                          const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } else {
                          // excel export
                          if (exportRole) {
                            blob = await adminAPI.exportUsersByRoleToExcel(exportRole);
                          } else {
                            blob = await adminAPI.exportUsersToExcel();
                          }
                          const filename = exportRole ? `users_${exportRole}_export.xlsx` : 'users_export.xlsx';
                          const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        }
                        setOpenExportModal(false);
                      } catch (err) {
                        alert('Export failed: ' + (err?.message || err));
                      }
                    }} sx={{ background: '#fc8019', '&:hover': { background: '#e6730a' }, textTransform: 'none' }}>
                      Export
                    </Button>
                  </Stack>
                }
              >
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2">Export Type</Typography>
                    <RadioGroup row value={exportType} onChange={(e) => setExportType(e.target.value)}>
                      <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                      <FormControlLabel value="excel" control={<Radio />} label="Excel" />
                    </RadioGroup>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2">Role</Typography>
                    <RadioGroup row value={exportRole} onChange={(e) => setExportRole(e.target.value)}>
                      <FormControlLabel value="" control={<Radio />} label="All" />
                      <FormControlLabel value="CUSTOMER" control={<Radio />} label="Customer" />
                      <FormControlLabel value="ADMIN" control={<Radio />} label="Admin" />
                      <FormControlLabel value="RESTAURANT_OWNER" control={<Radio />} label="Restaurant Owner" />
                      <FormControlLabel value="DELIVERY_PARTNER" control={<Radio />} label="Delivery Partner" />
                    </RadioGroup>
                  </Box>
                </Stack>
              </Modal>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>

                <TextField 

                  label="Search users"

                  value={userSearch}

                  onChange={(e) => setUserSearch(e.target.value)

                  }

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

              </ Stack>

              
              {loading.users && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error.users && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.users}
                </Alert>
              )}
              
              {!loading.users && (
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

                  onToggleActive={(user) => dispatch(toggleUserStatus({ id: user.id, isActive: !user.isActive }))}
              />

              )}
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

                  onChange={(e) => {
                    setRestaurantFilter(e.target.value);
                    if (e.target.value === 'PENDING') {
                      dispatch(fetchPendingRestaurants({ page: 0, size: 10 }));
                    } else {
                      dispatch(fetchRestaurants({ page: 0, size: 10, status: e.target.value === 'ALL' ? null : e.target.value }));
                    }
                  }}
                  sx={{ minWidth: 220 }}

                  SelectProps={{ native: true }}

                  InputLabelProps={{ shrink: true }}

                >

                  <option value="ALL">All</option>

                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>

                  <option value="REJECTED">Rejected</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </TextField>

              </Stack>

              
              {loading.restaurants && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error.restaurants && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.restaurants}
                </Alert>
              )}
              
              {!loading.restaurants && (
              <RestaurantsTable 

                  restaurants={restaurants}
                onViewRestaurant={() => {}}

                onEditRestaurant={(r) => { setFormValues(r); setOpenRestaurantModal(true); }}

                onDeleteRestaurant={(r) => dispatch(deleteRestaurant(r.id))}

                  onToggleActive={(r) => dispatch(setRestaurantActiveAsync({ restaurantId: r.id, isActive: !r.isActive }))}
                  onToggleOpen={(r) => dispatch(setRestaurantOpenAsync({ restaurantId: r.id, isOpen: !r.isOpen }))}
                  onApprove={(r) => dispatch(approveRestaurant({ restaurantId: r.id, approvalData: { approvalNotes: 'Approved by admin' } }))}
                  onReject={(r) => dispatch(rejectRestaurant({ restaurantId: r.id, rejectionData: { rejectionReason: 'Rejected by admin' } }))}
                />
              )}
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
                addButtonText="Refresh Partners"
                onAddClick={() => { dispatch(fetchAllDeliveryPartners()); }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField 
                  select 
                  label="Filter"
                  value={userRoleFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserRoleFilter(val);
                    dispatch(fetchAllDeliveryPartners()).then(() => {
                      // No server-side filter, we'll filter in render
                    });
                  }}
                  sx={{ minWidth: 220 }}
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OFFLINE">Offline</option>
                </TextField>
              </Stack>

              
              {loading.partners && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error.partners && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.partners}
                </Alert>
              )}
              
              {!loading.partners && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    Showing all delivery partners. Pending applications can be approved or rejected. 
                    Approved partners show their current status: AVAILABLE (ready for orders), ON_DELIVERY (currently delivering), or OFFLINE (inactive).
                  </Typography>
              <DeliveryPartnersTable 
                partners={partners.filter(p => {
                  if (userRoleFilter === 'PENDING') return p.isPending;
                  if (userRoleFilter === 'AVAILABLE') return (p.status || '').toString() === 'AVAILABLE';
                  if (userRoleFilter === 'OFFLINE') return (p.status || '').toString() === 'OFFLINE' || p.isOffline;
                  return true;
                })}
                onViewPartner={() => {}}
                onEditPartner={(p) => { setFormValues(p); setOpenPartnerModal(true); }}
                onDeletePartner={(p) => dispatch(deletePartner(p.id))}
                  onApprove={(p) => dispatch(approveDeliveryPartner(p.userId))}
                  onReject={(p) => dispatch(rejectDeliveryPartner(p.userId))}
                />
                </Box>
              )}
            </Box>
          )}

          {tabValue === 4 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Coupon Management" 
                subtitle="Manage discount coupons and promotions"
                addButtonText="Add Coupon"
                onAddClick={() => { 
                  setFormValues({ 
                    code: '', 
                    description: '', 
                    type: 'PERCENTAGE', 
                    discountValue: 10, 
                    minimumOrderAmount: 100,
                    maximumDiscountAmount: 50,
                    totalUsageLimit: 1000,
                    usagePerUserLimit: 1,
                    validFrom: new Date().toISOString().slice(0, 16),
                    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                    isActive: true,
                    terms: ''
                  }); 
                  setOpenCouponsModal(true); 
                }}
              />
              
              {loading.coupons && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error.coupons && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.coupons}
                </Alert>
              )}
              
              {!loading.coupons && (
                <TableContainer sx={{ borderRadius: '3px', border: '1px solid #e0e0e0', background: '#fff' }}>
                  <Table>
                    <TableHead sx={{ background: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Value</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Min Order</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Valid</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {coupons.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.code}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.description}</Typography>
                          </TableCell>
                          <TableCell>{(c.type || '').toString()}</TableCell>
                          <TableCell>₹{Number(c.discountValue || 0).toFixed(2)}</TableCell>
                          <TableCell>₹{Number(c.minimumOrderAmount || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{c.validFrom ? new Date(c.validFrom).toLocaleDateString() : '—'} → {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'success' : 'default'} variant="outlined" size="small" />
                          </TableCell>
                          <TableCell>
                            <ActionButtons 
                              menuOnly 
                              onEdit={() => { setFormValues({ ...c, type: (c.type || '').toString() }); setOpenCouponsModal(true); }}
                              onDelete={() => dispatch(deleteCoupon(c.id))}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {tabValue === 5 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Transaction Management" 
                subtitle="View and manage payment transactions"
                showAddButton={false}
              />
              
              {loading.transactions && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error.transactions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error.transactions}
                </Alert>
              )}
              
              {!loading.transactions && (
                <TransactionsTable transactions={transactions} />
              )}
            </Box>
          )}

          {tabValue === 6 && (
            <Box sx={{ p: 4 }}>
              <TabHeader 
                title="Analytics Dashboard" 
                subtitle="View platform analytics and insights"
                showAddButton={false}
              />
              
              <ChartControls
                period={analyticsPeriod}
                onPeriodChange={(newPeriod) => {
                  setAnalyticsPeriod(newPeriod);
                  dispatch(fetchAnalytics({ type: 'order', period: newPeriod }));
                  dispatch(fetchAnalytics({ type: 'delivery', period: newPeriod }));
                }}
                onRefresh={() => {
                  dispatch(fetchAnalytics({ type: 'order', period: analyticsPeriod }));
                  dispatch(fetchAnalytics({ type: 'delivery', period: analyticsPeriod }));
                }}
              />
              
              <Box sx={{ width: '100%' }}>
                {/* Row 1: Order Trends & Revenue Analytics */}
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <AreaChart
                      title="Order Trends"
                      data={analytics.order?.dailyOrders || []}
                      dataKey="orderCount"
                      xAxisKey="date"
                      color="#2196f3"
                      height={400}
                      formatXAxis={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      formatYAxis={(value) => value}
                      formatTooltip={(value, name) => [`${value} orders`, 'Orders']}
                      gradientId="orderTrendsGradient"
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <AreaChart
                      title="Revenue Analytics"
                      data={analytics.order?.dailyOrders || []}
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
                      gradientId="adminRevenueGradient"
                    />
                  </Box>
                </Box>

                {/* Row 2: Order Status Distribution & Top Restaurants */}
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <PieChart
                      title="Order Status Distribution"
                      data={(analytics.order?.statusDistribution || []).map(status => ({
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
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <BarChart
                      title="Top Performing Restaurants"
                      data={(analytics.order?.topRestaurants || []).slice(0, 10).map(restaurant => ({
                        name: restaurant.restaurantName || restaurant.name,
                        orders: restaurant.orderCount || restaurant.count || 0,
                        revenue: restaurant.revenue || 0
                      }))}
                      dataKey="orders"
                      xAxisKey="name"
                      color="#ff9800"
                      height={400}
                      formatXAxis={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                      formatYAxis={(value) => value}
                      formatTooltip={(value, name, props) => [
                        `${value} orders`, 
                        'Orders',
                        `Revenue: ₹${props.payload?.revenue?.toLocaleString() || 0}`
                      ]}
                    />
                  </Box>
                </Box>

                {/* Row 3: Customer Analytics & Summary Cards */}
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <BarChart
                      title="Customer Analytics"
                      data={[
                        { name: 'Total Customers', value: analytics.order?.totalCustomers || 0, color: '#4caf50' },
                        { name: 'New Customers', value: analytics.order?.newCustomers || 0, color: '#2196f3' },
                        { name: 'Avg Orders/Customer', value: analytics.order?.averageOrdersPerCustomer || 0, color: '#ff9800' }
                      ]}
                      dataKey="value"
                      xAxisKey="name"
                      color="#6c757d"
                      height={400}
                      formatXAxis={(value) => value.replace('Customers', '').replace('Avg Orders/', 'Avg/')}
                      formatYAxis={(value) => typeof value === 'number' && value < 10 ? value.toFixed(1) : Math.round(value)}
                      formatTooltip={(value, name, props) => [
                        typeof value === 'number' && value < 10 ? value.toFixed(1) : Math.round(value), 
                        props.payload?.name || name
                      ]}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '400px' }}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 3, 
                      height: '100%' 
                    }}>
                      <Box sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#2196f3', fontWeight: 600, fontSize: '16px' }}>Total Orders</Typography>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>{analytics.order?.totalOrders || 0}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>This Period</Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 600, fontSize: '16px' }}>Total Revenue</Typography>
                        <Typography variant="h3" color="success.main" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>₹{(analytics.order?.totalRevenue || 0).toLocaleString()}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>This Period</Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800', fontWeight: 600, fontSize: '16px' }}>Deliveries</Typography>
                        <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>{analytics.delivery?.totalDeliveries || 0}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>Completed</Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0', fontWeight: 600, fontSize: '16px' }}>Partners</Typography>
                        <Typography variant="h3" color="info.main" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>{analytics.delivery?.totalPartners || 0}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>Active</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
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

              <Button 
                onClick={() => setOpenOrderModal(false)} 
                variant="outlined"
                sx={{
                  borderRadius: '3px',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#fc8019',
                    color: '#fc8019',
                    backgroundColor: 'rgba(252, 128, 25, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>

              <Button 
                variant="contained" 
                onClick={() => {
                  if (formValues?.id) {
                    if (formValues.orderStatus || formValues.status) {
                      const enumStatus = (formValues.orderStatus || formValues.status || '').toString().toUpperCase();
                      dispatch(updateOrderStatus({ orderId: formValues.id, status: enumStatus }));
                    }
                  }
                  setOpenOrderModal(false);
                }}
                sx={{ 
                  background: '#fc8019',
                  borderRadius: '3px',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  fontSize: '14px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: '#e6730a',
                    boxShadow: '0 2px 8px rgba(252, 128, 25, 0.2)',
                  }
                }}
              >
                Save Changes
              </Button>

            </Stack>

          }

        >

          <Stack spacing={2}>

            {/* Swiggy-style Order Header */}
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)', 
              borderRadius: '3px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                opacity: 0.3
              }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: '20px' }}>
                    Order #{formValues.id || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '13px' }}>
                    {formValues.createdAt || formValues.orderDate ? new Date(formValues.createdAt || formValues.orderDate).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                <Chip 
                  label={(formValues.orderStatus || formValues.status || '').toString().replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  variant="outlined"
                  sx={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    fontWeight: 500,
                    fontSize: '11px',
                    height: '28px',
                    borderRadius: '14px'
                  }} 
                />
              </Box>

              {/* Restaurant & Customer Info */}
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {/* Restaurant Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={restaurantData.image || '/images/restaurant-placeholder.png'} 
                      alt="Restaurant"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '10px', fontWeight: 500 }}>FROM</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px' }}>
                      {formValues.restaurantName || restaurantData.name || `Restaurant #${formValues.restaurantId || 'N/A'}`}
                    </Typography>
                  </Box>
                </Box>

                {/* Customer Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>👤</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '10px', fontWeight: 500 }}>TO</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px' }}>
                      {formValues.customerName || `Customer #${formValues.userId || formValues.customerId || 'N/A'}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Swiggy-style Order Items */}
            {Array.isArray(formValues.items) && formValues.items.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600, fontSize: '16px' }}>
                  Your Order
                </Typography>
                <Stack spacing={1.5}>
                  {formValues.items.map((item, index) => (
                    <Box key={item.id || index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 2,
                      p: 2, 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '3px',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      {/* Item Image */}
                      <Box sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '3px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#f5f5f5'
                      }}>
                        <img 
                          src={item.imageUrl || item.image || '/images/food-placeholder.png'} 
                          alt={item.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      </Box>

                      {/* Item Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600, 
                          color: '#333', 
                          fontSize: '14px',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name || 'Unknown Item'}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: '#666', 
                          fontSize: '12px',
                          mb: 0.5
                        }}>
                          Qty: {item.quantity || 1}
                        </Typography>

                        {/* Customization */}
                        {item.customization && (
                          <Typography variant="body2" sx={{ 
                            color: '#888', 
                            fontSize: '11px',
                            fontStyle: 'italic'
                          }}>
                            Customization: {item.customization}
                          </Typography>
                        )}

                        {/* Special Instructions */}
                        {item.specialInstructions && (
                          <Typography variant="body2" sx={{ 
                            color: '#888', 
                            fontSize: '11px',
                            fontStyle: 'italic'
                          }}>
                            Note: {item.specialInstructions}
                          </Typography>
                        )}
                    </Box>

                      {/* Price */}
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="body2" sx={{ 
                          color: '#666', 
                          fontSize: '11px',
                          mb: 0.5
                        }}>
                          ₹{Number(item.price || 0).toFixed(2)} each
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600, 
                          color: '#333',
                          fontSize: '14px'
                        }}>
                          ₹{Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </Typography>
                  </Box>
                    </Box>
                ))}
              </Stack>
              </Box>
            )}

            {/* Swiggy-style Order Summary */}
            <Box sx={{ 
              mt: 2, 
              p: 2.5, 
              border: '1px solid #f0f0f0', 
              borderRadius: '3px', 
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600, fontSize: '16px' }}>
                Bill Details
              </Typography>
              
              {/* Calculate subtotal from items like OrderCard does */}
              {(() => {
                const subtotal = Array.isArray(formValues.items) 
                  ? formValues.items.reduce((s, x) => s + ((x.price || 0) * (x.quantity || 1)), 0)
                  : (formValues.subtotal || 0);
                const total = formValues.totalAmount || formValues.total || subtotal;
                
                return (
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>Item Total</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>
                        ₹{Number(subtotal).toFixed(2)}
                      </Typography>
                    </Box>

                    {formValues.deliveryFee && formValues.deliveryFee > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>Delivery Fee</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>
                          ₹{Number(formValues.deliveryFee).toFixed(2)}
                        </Typography>
                      </Box>
                    )}

                    {formValues.discount && formValues.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4caf50', fontSize: '13px' }}>Discount Applied</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50', fontSize: '13px' }}>
                          -₹{Number(formValues.discount).toFixed(2)}
                        </Typography>
            </Box>
                    )}

                    <Divider sx={{ my: 1, borderColor: '#f0f0f0' }} />

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      background: 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
                      borderRadius: '3px',
                      color: 'white'
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '16px' }}>Total Amount</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '16px' }}>
                        ₹{Number(total).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })()}
            </Box>

            {/* Swiggy-style Delivery Information */}
            {formValues.deliveryAddress && (
              <Box sx={{ 
                mt: 2, 
                p: 2.5, 
                border: '1px solid #f0f0f0', 
                borderRadius: '3px', 
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ mb: 1.5, color: '#333', fontWeight: 600, fontSize: '16px' }}>
                  Delivery Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fc8019',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.5
                  }}>
                    <Typography sx={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>📍</Typography>
            </Box>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '13px', lineHeight: 1.4 }}>
                    {formValues.deliveryAddress}
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField 
              select 
              label="Status" 
              value={(formValues.orderStatus || formValues.status || '').toString()}
              onChange={(e) => setFormValues(v => ({ ...v, orderStatus: e.target.value }))}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY_FOR_PICKUP">Ready For Pickup</option>
              <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </TextField>

            {/* Swiggy-style Delivery Assignment Section */}
            <Box sx={{ 
              mt: 2, 
              p: 2.5, 
              border: '1px solid #f0f0f0', 
              borderRadius: '3px', 
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600, fontSize: '16px' }}>
                Delivery Partner
              </Typography>
              
              {/* Show assignment status */}
              {formValues.deliveryAssignment ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  p: 1.5,
                  background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                  borderRadius: '3px',
                  color: 'white'
                }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Typography sx={{ color: 'white', fontSize: '14px' }}>✓</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px' }}>
                      Partner Assigned
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '12px' }}>
                      {formValues.deliveryPartnerName || `Partner ID: ${formValues.deliveryAssignment.deliveryPartnerId}`}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  p: 1.5,
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  borderRadius: '3px',
                  color: 'white',
                  mb: 1.5
                }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Typography sx={{ color: 'white', fontSize: '14px' }}>⚠</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '14px' }}>
                      No Partner Assigned
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '12px' }}>
                      Click below to assign a delivery partner
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Assign for Delivery Button */}
              {!formValues.deliveryAssignment && (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (formValues?.id) {
                      dispatch(assignOrderToPartner({ orderId: formValues.id }));
                    }
                  }}
                  sx={{ 
                    background: '#fc8019',
                    borderRadius: '3px',
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    border: '1px solid #fc8019',
                    '&:hover': {
                      background: '#e6730a',
                      borderColor: '#e6730a',
                      boxShadow: '0 2px 8px rgba(252, 128, 25, 0.2)',
                    }
                  }}
                >
                  Assign for Delivery
                </Button>
              )}
            </Box>

          </Stack>

        </Modal>



        {/* Coupons Modal */}

        <Modal 

          open={openCouponsModal}

          onClose={() => setOpenCouponsModal(false)}

          title={formValues?.id ? 'Edit Coupon' : 'Add Coupon'}
          actions={

            <Stack direction="row" spacing={2}>

              <Button onClick={() => setOpenCouponsModal(false)} variant="outlined">Cancel</Button>
              <Button 
                variant="contained" 
                sx={{ background: '#fc8019' }}
                onClick={() => {
                  // Validate required fields
                  if (!formValues.code || !formValues.description || !formValues.type || !formValues.discountValue) {
                    dispatch(showNotification({ 
                      message: 'Please fill in all required fields (Code, Description, Type, Discount Value)', 
                      type: 'error' 
                    }));
                    return;
                  }

                  // Transform form data to match backend requirements
                  const transformedData = {
                    code: formValues.code.trim().toUpperCase(),
                    description: formValues.description.trim(),
                    type: formValues.type,
                    discountValue: parseFloat(formValues.discountValue),
                    minimumOrderAmount: formValues.minimumOrderAmount ? parseFloat(formValues.minimumOrderAmount) : null,
                    maximumDiscountAmount: formValues.maximumDiscountAmount ? parseFloat(formValues.maximumDiscountAmount) : null,
                    validFrom: formValues.validFrom ? new Date(formValues.validFrom).toISOString() : new Date().toISOString(),
                    validUntil: formValues.validUntil ? new Date(formValues.validUntil).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                    totalUsageLimit: parseInt(formValues.totalUsageLimit) || 1000,
                    usagePerUserLimit: parseInt(formValues.usagePerUserLimit) || 1,
                    restaurantId: formValues.restaurantId ? parseInt(formValues.restaurantId) : null,
                    userId: formValues.userId ? parseInt(formValues.userId) : null,
                    terms: formValues.terms || '',
                    isActive: formValues.isActive !== false
                  };

                  console.log('Sending coupon data:', transformedData);

                  if (formValues?.id) {
                    dispatch(updateCoupon({ couponId: formValues.id, couponData: transformedData }));
                  } else {
                    dispatch(createCoupon(transformedData));
                  }
                  setOpenCouponsModal(false);
                }}
              >
                {formValues?.id ? 'Update' : 'Create'}
              </Button>
            </Stack>

          }

        >

          <Stack spacing={2}>

            <TextField label="Coupon Code" value={formValues.code || ''} onChange={(e) => setFormValues(v => ({ ...v, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'') }))} fullWidth required />
            <TextField 
              label="Description" 
              value={formValues.description || ''} 
              onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value }))} 
              fullWidth 
              multiline
              rows={2}
            />
            <TextField select label="Type" value={formValues.type || 'PERCENTAGE'} onChange={(e) => setFormValues(v => ({ ...v, type: e.target.value }))} fullWidth SelectProps={{ native: true }}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
              <option value="FREE_DELIVERY">Free Delivery</option>
            </TextField>
            <TextField 
              label="Discount Value" 
              value={formValues.discountValue || ''} 
              onChange={(e) => setFormValues(v => ({ ...v, discountValue: e.target.value }))} 
              fullWidth 
              type="number"
              required
            />
            <TextField 
              label="Minimum Order Amount" 
              value={formValues.minimumOrderAmount || ''} 
              onChange={(e) => setFormValues(v => ({ ...v, minimumOrderAmount: e.target.value }))} 
              fullWidth 
              type="number"
            />
            <TextField label="Maximum Discount Amount" value={formValues.maximumDiscountAmount || ''} onChange={(e) => setFormValues(v => ({ ...v, maximumDiscountAmount: e.target.value }))} fullWidth type="number" />
            <TextField label="Valid From" type="datetime-local" value={formValues.validFrom || ''} onChange={(e) => setFormValues(v => ({ ...v, validFrom: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Valid Until" type="datetime-local" value={formValues.validUntil || ''} onChange={(e) => setFormValues(v => ({ ...v, validUntil: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField 
              label="Total Usage Limit" 
              value={formValues.totalUsageLimit || ''} 
              onChange={(e) => setFormValues(v => ({ ...v, totalUsageLimit: e.target.value }))} 
              fullWidth 
              type="number"
            />
            <TextField label="Usage Per User Limit" value={formValues.usagePerUserLimit || ''} onChange={(e) => setFormValues(v => ({ ...v, usagePerUserLimit: e.target.value }))} fullWidth type="number" />
            <TextField label="Restaurant ID (optional)" value={formValues.restaurantId || ''} onChange={(e) => setFormValues(v => ({ ...v, restaurantId: e.target.value }))} fullWidth type="number" />
            <TextField label="User ID (optional)" value={formValues.userId || ''} onChange={(e) => setFormValues(v => ({ ...v, userId: e.target.value }))} fullWidth type="number" />
            <TextField label="Terms" value={formValues.terms || ''} onChange={(e) => setFormValues(v => ({ ...v, terms: e.target.value }))} fullWidth multiline rows={2} />
            <TextField select label="Active" value={(formValues.isActive ?? true) ? 'true' : 'false'} onChange={(e) => setFormValues(v => ({ ...v, isActive: e.target.value === 'true' }))} fullWidth SelectProps={{ native: true }}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </TextField>
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

                    dispatch(updateUser({ id: formValues.id, userData: { name: formValues.name, email: formValues.email, phone: formValues.phone, role: formValues.role } }));
                  } else {

                    dispatch(createUser({ userData: { name: formValues.name, email: formValues.email, phone: formValues.phone, password: formValues.password }, role: formValues.role || 'CUSTOMER' }));
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
            {!formValues?.id && (
              <TextField label="Password" type="password" value={formValues.password || ''} onChange={(e) => setFormValues(v => ({ ...v, password: e.target.value }))} fullWidth />
            )}

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
                    const data = {
                      name: formValues.name,
                      cuisineType: formValues.cuisineType || formValues.cuisine,
                      address: formValues.address,
                      contactNumber: formValues.contactNumber,
                      description: formValues.description,
                      image: formValues.image,
                      coverImage: formValues.coverImage,
                      deliveryTime: formValues.deliveryTime,
                      deliveryFee: formValues.deliveryFee,
                      minimumOrder: formValues.minimumOrder,
                      openingHours: formValues.openingHours,
                      openingTime: formValues.openingTime,
                      closingTime: formValues.closingTime,
                      deliveryRadiusKm: formValues.deliveryRadiusKm,
                      latitude: formValues.latitude,
                      longitude: formValues.longitude,
                      tags: formValues.tags,
                      isOpen: formValues.isOpen,
                      isActive: formValues.isActive,
                    };
                    if (formValues.status) data.status = formValues.status;
                    if (formValues.ownerId) data.ownerId = formValues.ownerId;
                    dispatch(updateRestaurantProfile({ id: formValues.id, data }));
                    if (formValues.status) {
                      dispatch(updateRestaurantStatus({ restaurantId: formValues.id, status: formValues.status }));
                    }
                  } else {
                    const data = {
                      name: formValues.name,
                      cuisineType: formValues.cuisineType || formValues.cuisine,
                      address: formValues.address,
                      contactNumber: formValues.contactNumber,
                      description: formValues.description,
                      image: formValues.image,
                      coverImage: formValues.coverImage,
                      deliveryTime: formValues.deliveryTime,
                      deliveryFee: formValues.deliveryFee,
                      minimumOrder: formValues.minimumOrder,
                      openingHours: formValues.openingHours,
                      openingTime: formValues.openingTime,
                      closingTime: formValues.closingTime,
                      deliveryRadiusKm: formValues.deliveryRadiusKm,
                      latitude: formValues.latitude,
                      longitude: formValues.longitude,
                      tags: formValues.tags,
                      isOpen: formValues.isOpen ?? true,
                      isActive: formValues.isActive ?? true,
                      ownerId: formValues.ownerId,
                    };
                    if (formValues.status) data.status = formValues.status;
                    dispatch(createRestaurant(data));
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

            <TextField label="Cuisine Type" value={formValues.cuisineType || formValues.cuisine || ''} onChange={(e) => setFormValues(v => ({ ...v, cuisineType: e.target.value }))} fullWidth />

            <TextField label="Address" value={formValues.address || ''} onChange={(e) => setFormValues(v => ({ ...v, address: e.target.value }))} fullWidth />

            <TextField label="Contact Number" value={formValues.contactNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, contactNumber: e.target.value }))} fullWidth />
            <TextField label="Description" value={formValues.description || ''} onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value }))} fullWidth multiline rows={2} />
            <TextField label="Image URL" value={formValues.image || ''} onChange={(e) => setFormValues(v => ({ ...v, image: e.target.value }))} fullWidth />
            <TextField label="Cover Image URL" value={formValues.coverImage || ''} onChange={(e) => setFormValues(v => ({ ...v, coverImage: e.target.value }))} fullWidth />
            <TextField label="Delivery Time (e.g., 25-30 mins)" value={formValues.deliveryTime || ''} onChange={(e) => setFormValues(v => ({ ...v, deliveryTime: e.target.value }))} fullWidth />
            <TextField label="Delivery Fee" type="number" value={formValues.deliveryFee || ''} onChange={(e) => setFormValues(v => ({ ...v, deliveryFee: e.target.value }))} fullWidth />
            <TextField label="Minimum Order" type="number" value={formValues.minimumOrder || ''} onChange={(e) => setFormValues(v => ({ ...v, minimumOrder: e.target.value }))} fullWidth />
            <TextField label="Opening Hours (text)" value={formValues.openingHours || ''} onChange={(e) => setFormValues(v => ({ ...v, openingHours: e.target.value }))} fullWidth />
            <TextField label="Opening Time" type="time" value={formValues.openingTime || ''} onChange={(e) => setFormValues(v => ({ ...v, openingTime: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Closing Time" type="time" value={formValues.closingTime || ''} onChange={(e) => setFormValues(v => ({ ...v, closingTime: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Delivery Radius (km)" type="number" value={formValues.deliveryRadiusKm || ''} onChange={(e) => setFormValues(v => ({ ...v, deliveryRadiusKm: e.target.value }))} fullWidth />
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField label="Latitude" type="number" value={formValues.latitude || ''} onChange={(e) => setFormValues(v => ({ ...v, latitude: e.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Longitude" type="number" value={formValues.longitude || ''} onChange={(e) => setFormValues(v => ({ ...v, longitude: e.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={6} md={2}>
                <Button fullWidth variant="outlined" size="medium" onClick={() => dispatch(openMapModal())}>Select on Map</Button>
              </Grid>
              <Grid item xs={6} md={2}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="medium"
                  disabled={isGeocoding}
                  onClick={() => {
                    if (isGeocoding) {
                      setPendingApplyMapLocation(true);
                      return;
                    }
                    const lat = selectedCoordinates?.lat ?? currentLocation.lat;
                    const lng = selectedCoordinates?.lng ?? currentLocation.lng;
                    setFormValues(v => ({ ...v, latitude: lat, longitude: lng, address: v.address || currentLocation.address }));
                  }} 
                  sx={{ background: '#fc8019' }}
                >
                  {isGeocoding ? 'Loading…' : 'Use Selected'}
                </Button>
              </Grid>
            </Grid>
            <TextField label="Tags (comma-separated)" value={formValues.tags || ''} onChange={(e) => setFormValues(v => ({ ...v, tags: e.target.value }))} fullWidth />

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

            <TextField select label="Restaurant Status" value={(formValues.status || '').toString()} onChange={(e) => setFormValues(v => ({ ...v, status: e.target.value }))} fullWidth SelectProps={{ native: true }}>
              <option value="">Select status</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
                  if (formValues?.userId) {
                    dispatch(updateDeliveryPartnerProfile({ userId: formValues.userId, profile: { name: formValues.name, phoneNumber: formValues.phoneNumber, vehicleDetails: formValues.vehicleDetails } }));
                  } else if (formValues?.id) {
                    dispatch(updatePartner({ id: formValues.id, changes: { name: formValues.name, phoneNumber: formValues.phoneNumber, vehicleDetails: formValues.vehicleDetails } }));
                  } else {
                    dispatch(addPartner({ name: formValues.name, phoneNumber: formValues.phoneNumber, vehicleDetails: formValues.vehicleDetails }));
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

            <TextField label="Phone Number" value={formValues.phoneNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, phoneNumber: e.target.value }))} fullWidth />

            <TextField label="Vehicle Details" value={formValues.vehicleDetails || ''} onChange={(e) => setFormValues(v => ({ ...v, vehicleDetails: e.target.value }))} fullWidth />

          </Stack>

        </Modal>

      </Container>

    </Box>

  );

};



export default AdminDashboard;

