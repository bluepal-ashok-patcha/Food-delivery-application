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
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Close, Restaurant } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { restaurantAPI } from '../../services/api';
import { showNotification } from '../../store/slices/uiSlice';

const RestaurantPartnerModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    cuisineType: '',
    description: '',
    image: '',
    coverImage: '',
    openingTime: '',
    closingTime: '',
    openingHours: '',
    deliveryTime: '',
    deliveryFee: '',
    minimumOrder: '',
    deliveryRadiusKm: '',
    latitude: '',
    longitude: '',
    tags: '',
    isVeg: false,
    isPureVeg: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await restaurantAPI.applyAsRestaurantOwner(formData);
      dispatch(showNotification({ 
        message: 'Restaurant application submitted successfully! We will review and get back to you soon.', 
        type: 'success' 
      }));
      onClose();
      setFormData({
        name: '',
        contactNumber: '',
        address: '',
        cuisineType: '',
        description: '',
        image: '',
        coverImage: '',
        openingTime: '',
        closingTime: '',
        openingHours: '',
        deliveryTime: '',
        deliveryFee: '',
        minimumOrder: '',
        deliveryRadiusKm: '',
        latitude: '',
        longitude: '',
        tags: '',
        isVeg: false,
        isPureVeg: false,
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application. Please try again.');
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
              <Restaurant sx={{ color: '#fc8019', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                Join as Restaurant Partner
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: '#666' }}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fill out the form below to apply as a restaurant partner. We'll review your application and get back to you within 2-3 business days.
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
            label="Restaurant Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your restaurant name"
          />

          <TextField
            fullWidth
            label="Contact Number"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            required
            type="tel"
            placeholder="Enter restaurant contact number"
          />

          <TextField
            fullWidth
            label="Restaurant Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            multiline
            rows={3}
            placeholder="Enter complete restaurant address"
          />

          <TextField
            fullWidth
            label="Cuisine Type"
            name="cuisineType"
            value={formData.cuisineType}
            onChange={handleInputChange}
            required
            placeholder="e.g., Indian, Chinese, Italian, Fast Food"
          />

          <TextField
            fullWidth
            label="Restaurant Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            placeholder="Tell us about your restaurant, specialties, and what makes it unique..."
          />

          <TextField
            fullWidth
            label="Restaurant Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/restaurant-image.jpg"
            helperText="URL to your restaurant's main image"
          />

          <TextField
            fullWidth
            label="Cover Image URL"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleInputChange}
            placeholder="https://example.com/restaurant-cover.jpg"
            helperText="URL to your restaurant's cover/banner image"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Opening Hours (e.g., 10:00 AM - 11:00 PM)"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleInputChange}
              placeholder="10:00 AM - 11:00 PM"
            />
            <TextField
              fullWidth
              label="Delivery Time (e.g., 25-30 mins)"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleInputChange}
              placeholder="25-30 mins"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Opening Time"
              name="openingTime"
              value={formData.openingTime}
              onChange={handleInputChange}
              type="time"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Closing Time"
              name="closingTime"
              value={formData.closingTime}
              onChange={handleInputChange}
              type="time"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Delivery Fee (₹)"
              name="deliveryFee"
              value={formData.deliveryFee}
              onChange={handleInputChange}
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              placeholder="0.00"
            />
            <TextField
              fullWidth
              label="Minimum Order (₹)"
              name="minimumOrder"
              value={formData.minimumOrder}
              onChange={handleInputChange}
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              placeholder="0.00"
            />
          </Box>

          <TextField
            fullWidth
            label="Delivery Radius (km)"
            name="deliveryRadiusKm"
            value={formData.deliveryRadiusKm}
            onChange={handleInputChange}
            type="number"
            inputProps={{ min: 1, max: 50 }}
            placeholder="Enter delivery radius in kilometers"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              type="number"
              inputProps={{ step: "any" }}
              placeholder="12.9716"
              helperText="Restaurant's latitude coordinate"
            />
            <TextField
              fullWidth
              label="Longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              type="number"
              inputProps={{ step: "any" }}
              placeholder="77.5946"
              helperText="Restaurant's longitude coordinate"
            />
          </Box>

          <TextField
            fullWidth
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Popular, Fast Delivery, Best Seller, Family Friendly"
            helperText="Add tags to help customers find your restaurant"
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Vegetarian Options Available"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="isPureVeg"
                  checked={formData.isPureVeg}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Pure Vegetarian Restaurant"
            />
          </Box>
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
                startIcon={loading ? <CircularProgress size={20} /> : <Restaurant />}
                sx={{
                  backgroundColor: '#fc8019',
                  '&:hover': { backgroundColor: '#e6730a' },
                  px: 3
                }}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default RestaurantPartnerModal;
