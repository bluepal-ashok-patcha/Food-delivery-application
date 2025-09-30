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
import AddressItem from '../../components/profile/AddressItem';
import EmptyAddresses from '../../components/profile/EmptyAddresses';
import OrderCard from '../../components/orders/OrderCard';
import EmptyOrdersCard from '../../components/orders/EmptyOrdersCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading } = useSelector((state) => state.orders);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (user && tab === 1) {
      dispatch(fetchOrders({ userId: user.id }));
    }
  }, [dispatch, user, tab]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(updateUserProfile(values));
      setIsEditing(false);
      dispatch(showNotification({ 
        message: 'Profile updated successfully!', 
        type: 'success' 
      }));
    },
  });

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      const address = {
        id: Date.now(),
        type: 'other',
        address: newAddress,
        isDefault: false
      };
      
      dispatch(updateUserProfile({
        addresses: [...(user.addresses || []), address]
      }));
      
      setNewAddress('');
      setIsAddingAddress(false);
      dispatch(showNotification({ 
        message: 'Address added successfully!', 
        type: 'success' 
      }));
    }
  };

  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
    dispatch(updateUserProfile({ addresses: updatedAddresses }));
    dispatch(showNotification({ 
      message: 'Address deleted successfully!', 
      type: 'success' 
    }));
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = user.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    dispatch(updateUserProfile({ addresses: updatedAddresses }));
    dispatch(showNotification({ 
      message: 'Default address updated!', 
      type: 'success' 
    }));
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
          {/* Personal Information */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: '12px', boxShadow: '0 4px 24px rgba(252,128,25,0.08)' }}>
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
                  borderRadius: '8px',
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
                  label="Full Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={!isEditing}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={!isEditing}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={!isEditing}
                  size="small"
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
                    borderRadius: '8px'
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
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Paper>
          {/* Delivery Addresses */}
          <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 4px 24px rgba(252,128,25,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                Delivery Addresses
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsAddingAddress(true)}
                size="small"
                sx={{ 
                  backgroundColor: '#fc8019',
                  '&:hover': { backgroundColor: '#e6730a' },
                  fontSize: '13px',
                  px: 2,
                  py: 1,
                  borderRadius: '8px'
                }}
              >
                Add Address
              </Button>
            </Box>
            {user?.addresses?.map((address) => (
              <AddressItem
                key={address.id}
                address={address}
                onSetDefault={() => handleSetDefaultAddress(address.id)}
                onDelete={() => handleDeleteAddress(address.id)}
              />
            ))}
            {isAddingAddress && (
              <Box sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  label="New Address"
                  multiline
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  sx={{ mb: 1.5 }}
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddAddress}
                    disabled={!newAddress.trim()}
                    size="small"
                    sx={{ 
                      backgroundColor: '#fc8019',
                      '&:hover': { backgroundColor: '#e6730a' },
                      fontSize: '13px',
                      px: 2,
                      py: 1,
                      borderRadius: '8px'
                    }}
                  >
                    Add Address
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setNewAddress('');
                      setIsAddingAddress(false);
                    }}
                    size="small"
                    sx={{ 
                      fontSize: '13px',
                      px: 2,
                      py: 1,
                      borderRadius: '8px'
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
            {(!user?.addresses || user.addresses.length === 0) && !isAddingAddress && (
              <EmptyAddresses onAdd={() => setIsAddingAddress(true)} />
            )}
          </Paper>
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
    </Container>
  );
};

export default ProfilePage;
