import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Grid,
  Divider,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Cancel, 
  Add,
  Delete,
  LocationOn
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { updateUserProfile } from '../../store/slices/authSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { userAPI } from '../../services/api';
import AddressItem from '../../components/profile/AddressItem';
import AddressEditModal from '../../components/profile/AddressEditModal';
import EmptyAddresses from '../../components/profile/EmptyAddresses';
import OrderCard from '../../components/orders/OrderCard';
import EmptyOrdersCard from '../../components/orders/EmptyOrdersCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { orders, loading } = useSelector((state) => state.orders);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editAddress, setEditAddress] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (user && tab === 1) {
      dispatch(fetchOrders({ 
        userId: user.id,
        sortBy: 'createdAt',
        sortDir: 'desc' // Latest orders first
      }));
    }
  }, [dispatch, user, tab]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userAPI.getProfile();
        if (!cancelled) setProfile(res?.data || res);
      } catch (_) {}
      finally { if (!cancelled) setLoadingProfile(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    phoneNumber: Yup.string().required('Phone is required'),
  });

  // Form for creating a new profile when none exists
  const createFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await userAPI.createProfile(values);
        const created = res?.data || res;
        setProfile(created);
        dispatch(showNotification({ message: 'Profile created successfully!', type: 'success' }));
      } catch (e) {
        dispatch(showNotification({ message: 'Failed to create profile', type: 'error' }));
      }
    }
  });

  const formik = useFormik({
    initialValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phoneNumber: profile?.phoneNumber || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const body = { ...values };
        const res = await userAPI.updateProfile(body);
        setProfile(res?.data || res);
        dispatch(showNotification({ message: 'Profile updated successfully!', type: 'success' }));
      } catch (e) {
        dispatch(showNotification({ message: 'Failed to update profile', type: 'error' }));
      } finally {
        setIsEditing(false);
      }
    },
  });

  const handleAddAddress = async () => {
    const [street, city, stateZip] = newAddress.split(',').map(s => s.trim());
    const [state, zipCode] = (stateZip || '').split(' ').map(s => s.trim());
    if (!street || !city || !state || !zipCode) {
      dispatch(showNotification({ message: 'Use format: Street, City, ST 12345', type: 'error' }));
      return;
    }
    try {
      const res = await userAPI.addAddress({ street, city, state, zipCode, type: 'Home' });
      const addr = res?.data || res;
      setProfile({ ...profile, addresses: [...(profile?.addresses || []), addr] });
      setNewAddress('');
      setIsAddingAddress(false);
      dispatch(showNotification({ message: 'Address added successfully!', type: 'success' }));
    } catch (e) {
      dispatch(showNotification({ message: 'Failed to add address', type: 'error' }));
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await userAPI.deleteAddress(addressId);
      setProfile({ ...profile, addresses: (profile?.addresses || []).filter(a => a.id !== addressId) });
      dispatch(showNotification({ message: 'Address deleted successfully!', type: 'success' }));
    } catch (e) {
      dispatch(showNotification({ message: 'Failed to delete address', type: 'error' }));
    }
  };

  const handleEditAddressSave = async (form) => {
    try {
      const res = await userAPI.updateAddress(editAddress.id, form);
      const updated = res?.data || res;
      setProfile({ ...profile, addresses: (profile?.addresses || []).map(a => a.id === editAddress.id ? updated : a) });
      setEditAddress(null);
      dispatch(showNotification({ message: 'Address updated successfully!', type: 'success' }));
    } catch (e) {
      dispatch(showNotification({ message: 'Failed to update address', type: 'error' }));
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const addr = (profile?.addresses || []).find(a => a.id === addressId);
      if (!addr) return;
      const res = await userAPI.updateAddress(addressId, { ...addr, isDefault: true });
      const updated = res?.data || res;
      // clear others
      const updatedList = (profile?.addresses || []).map(a => a.id === addressId ? updated : { ...a, isDefault: false });
      setProfile({ ...profile, addresses: updatedList });
      dispatch(showNotification({ message: 'Default address updated!', type: 'success' }));
    } catch (e) {
      dispatch(showNotification({ message: 'Failed to set default address', type: 'error' }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="profile tabs" variant="fullWidth">
          <Tab label="Profile" sx={{ fontWeight: 700, fontSize: '16px' }} />
          <Tab label="Your Orders" sx={{ fontWeight: 700, fontSize: '16px' }} />
        </Tabs>
      </Box>

      {tab === 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, fontSize: '24px', color: '#fc8019', mb: 2 }}>
            My Profile
          </Typography>
          {!loadingProfile && !profile && (
            <Paper sx={{ p: 2, mb: 2, borderRadius: '3px', boxShadow: '0 4px 24px rgba(252,128,25,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  Create Your Profile
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={createFormik.values.firstName}
                    onChange={createFormik.handleChange}
                    error={createFormik.touched.firstName && Boolean(createFormik.errors.firstName)}
                    helperText={createFormik.touched.firstName && createFormik.errors.firstName}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={createFormik.values.lastName}
                    onChange={createFormik.handleChange}
                    error={createFormik.touched.lastName && Boolean(createFormik.errors.lastName)}
                    helperText={createFormik.touched.lastName && createFormik.errors.lastName}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={createFormik.values.phoneNumber}
                    onChange={createFormik.handleChange}
                    error={createFormik.touched.phoneNumber && Boolean(createFormik.errors.phoneNumber)}
                    helperText={createFormik.touched.phoneNumber && createFormik.errors.phoneNumber}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={createFormik.handleSubmit}
                  size="small"
                  sx={{ 
                    backgroundColor: '#fc8019',
                    '&:hover': { backgroundColor: '#e6730a' },
                    fontSize: '13px',
                    px: 2,
                    py: 1,
                    borderRadius: '3px'
                  }}
                >
                  Create Profile
                </Button>
              </Box>
            </Paper>
          )}
          {loadingProfile && (
            <LoadingSpinner fullScreen={false} message="Loading profile..." />
          )}
          {!!profile && (
          <>
          {/* Personal Information */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: '3px', boxShadow: '0 4px 24px rgba(252,128,25,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                Personal Information
              </Typography>
              <Button
                variant={isEditing ? 'outlined' : 'contained'}
                startIcon={isEditing ? <Cancel /> : <Edit />}
                onClick={() => {
                  if (isEditing) {
                    formik.resetForm();
                  }
                  setIsEditing(!isEditing);
                }}
                size="small"
                sx={{ 
                  fontSize: '13px',
                  px: 2,
                  py: 1,
                  borderRadius: '3px',
                  backgroundColor: isEditing ? undefined : '#fc8019',
                  color: isEditing ? undefined : 'white',
                  '&:hover': { backgroundColor: isEditing ? undefined : '#e6730a' }
                }}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  disabled={!isEditing}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  disabled={!isEditing}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                  helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                  disabled={!isEditing}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            {isEditing && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={formik.handleSubmit}
                  size="small"
                  sx={{ 
                    backgroundColor: '#fc8019',
                    '&:hover': { backgroundColor: '#e6730a' },
                    fontSize: '13px',
                    px: 2,
                    py: 1,
                    borderRadius: '3px'
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    formik.resetForm();
                    setIsEditing(false);
                  }}
                  size="small"
                  sx={{ 
                    fontSize: '13px',
                    px: 2,
                    py: 1,
                    borderRadius: '3px'
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Paper>
          {/* Delivery Addresses */}
          <Paper sx={{ p: 2, borderRadius: '3px', boxShadow: '0 4px 24px rgba(252,128,25,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                Delivery Addresses
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setEditAddress({ street: '', city: '', state: '', zipCode: '', type: 'Home' })}
                size="small"
                sx={{ 
                  backgroundColor: '#fc8019',
                  '&:hover': { backgroundColor: '#e6730a' },
                  fontSize: '13px',
                  px: 2,
                  py: 1,
                  borderRadius: '3px'
                }}
              >
                Add Address
              </Button>
            </Box>
            {profile?.addresses?.map((address) => (
              <AddressItem
                key={address.id}
                address={address}
                onSetDefault={() => handleSetDefaultAddress(address.id)}
                onDelete={() => handleDeleteAddress(address.id)}
                onEdit={() => setEditAddress(address)}
              />
            ))}
            {(!profile?.addresses || profile.addresses.length === 0) && (
              <EmptyAddresses onAdd={() => setEditAddress({ street: '', city: '', state: '', zipCode: '', type: 'Home' })} />
            )}
          </Paper>
          </>
          )}
        </>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, fontSize: '24px', color: '#fc8019', mb: 2 }}>
            Your Orders
          </Typography>
          {loading ? (
            <LoadingSpinner fullScreen={false} message="Loading your orders..." />
          ) : orders.length === 0 ? (
            <EmptyOrdersCard />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </Box>
          )}
        </Box>
      )}
      <AddressEditModal open={!!editAddress} onClose={() => setEditAddress(null)} address={editAddress} onSave={async (form) => {
        if (editAddress && editAddress.id) {
          await handleEditAddressSave(form);
        } else {
          try {
            const res = await userAPI.addAddress(form);
            const addr = res?.data || res;
            setProfile({ ...profile, addresses: [...(profile?.addresses || []), addr] });
            setEditAddress(null);
            dispatch(showNotification({ message: 'Address added successfully!', type: 'success' }));
          } catch (e) {
            dispatch(showNotification({ message: 'Failed to add address', type: 'error' }));
          }
        }
      }} />
    </Container>
  );
};

export default ProfilePage;
