import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Close, DeliveryDining } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { deliveryAPI } from '../../services/api';
import { showNotification } from '../../store/slices/uiSlice';

const DeliveryPartnerModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: '',
    vehicleDetails: '',
    status: 'OFFLINE', // Initial status for new registrations (matches backend enum)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await deliveryAPI.selfRegisterAsDeliveryPartner(formData);
      dispatch(showNotification({ 
        message: 'Delivery partner registration submitted successfully! We will review and get back to you soon.', 
        type: 'success' 
      }));
      onClose();
      setFormData({
        name: user?.name || '',
        phoneNumber: '',
        vehicleDetails: '',
        status: 'OFFLINE', // Reset to initial status
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sticky Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeliveryDining sx={{ color: '#4caf50', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                Partner with Us
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: '#666' }}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Join our delivery partner network and start earning! Fill out the form below to register as a delivery partner.
          </Typography>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            p: 3,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a8a8a8',
            },
          }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            type="tel"
            placeholder="Enter your phone number"
          />

          <TextField
            fullWidth
            label="Vehicle Details"
            name="vehicleDetails"
            value={formData.vehicleDetails}
            onChange={handleInputChange}
            multiline
            rows={2}
            placeholder="e.g., Motorcycle - BA 01 PA 1234, or Car - KA 01 AB 1234"
          />
            </form>
          </Box>

          {/* Sticky Footer */}
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e0e0e0',
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRadius: '0 0 12px 12px'
          }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{ px: 3 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <DeliveryDining />}
                sx={{
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#388e3c' },
                  px: 3
                }}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default DeliveryPartnerModal;
