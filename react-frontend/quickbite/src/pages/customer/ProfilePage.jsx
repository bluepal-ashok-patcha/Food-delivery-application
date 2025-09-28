import React, { useState } from 'react';
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
  IconButton
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

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');

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
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '20px' }}>
        My Profile
      </Typography>

      {/* Personal Information */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
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
              borderRadius: '6px'
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
                borderRadius: '6px'
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
                borderRadius: '6px'
              }}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Paper>

      {/* Delivery Addresses */}
      <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
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
              borderRadius: '6px'
            }}
          >
            Add Address
          </Button>
        </Box>

        {user?.addresses?.map((address) => (
          <Box key={address.id} sx={{ mb: 1.5 }}>
            <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '6px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: 'text.secondary', fontSize: '18px' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>
                    {address.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                    {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                    {address.isDefault && ' • Default'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {!address.isDefault && (
                  <Button
                    size="small"
                    onClick={() => handleSetDefaultAddress(address.id)}
                    sx={{ fontSize: '11px', px: 1, py: 0.5 }}
                  >
                    Set Default
                  </Button>
                )}
                <IconButton
                  color="error"
                  onClick={() => handleDeleteAddress(address.id)}
                  size="small"
                  sx={{ width: '28px', height: '28px' }}
                >
                  <Delete sx={{ fontSize: '16px' }} />
                </IconButton>
              </Box>
            </Paper>
          </Box>
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
                  borderRadius: '6px'
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
                  borderRadius: '6px'
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {(!user?.addresses || user.addresses.length === 0) && !isAddingAddress && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h6" gutterBottom sx={{ fontSize: '16px' }}>
              No addresses added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '14px' }}>
              Add your delivery addresses for faster checkout
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
                borderRadius: '6px'
              }}
            >
              Add Your First Address
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
