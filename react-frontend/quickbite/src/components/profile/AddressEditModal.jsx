import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Box, Typography, InputAdornment, CircularProgress, Alert, Stack } from '@mui/material';
import { Search, MyLocation, LocationOn } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../store/slices/uiSlice';
import { reverseGeocodeLocation, geocodeLocation } from '../../store/slices/locationSlice';

const AddressEditModal = ({ open, onClose, address, onSave }) => {
  const dispatch = useDispatch();
  const { currentLocation } = useSelector((state) => state.location);
  
  const [form, setForm] = useState({ street: '', city: '', state: '', zipCode: '', type: 'Home' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (address) {
      setForm({ 
        street: address.street || '', 
        city: address.city || '', 
        state: address.state || '', 
        zipCode: address.zipCode || '', 
        type: address.type || 'Home' 
      });
    } else {
      setForm({ street: '', city: '', state: '', zipCode: '', type: 'Home' });
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, [address, open]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await dispatch(reverseGeocodeLocation(searchQuery)).unwrap();
      setSearchResults([result]);
      setShowSearchResults(true);
    } catch (error) {
      dispatch(showNotification({
        message: 'Address not found. Please try a different search.',
        type: 'error'
      }));
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!currentLocation?.lat || !currentLocation?.lng) {
      dispatch(showNotification({
        message: 'Current location not available',
        type: 'error'
      }));
      return;
    }

    try {
      setIsGeocoding(true);
      const result = await dispatch(geocodeLocation(currentLocation)).unwrap();
      
      // Parse the address into components
      const addressParts = result.address.split(',').map(s => s.trim());
      const newForm = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || '',
        type: form.type
      };
      
      setForm(newForm);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to get address from current location',
        type: 'error'
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    // Parse the address into components
    const addressParts = result.address.split(',').map(s => s.trim());
    const newForm = {
      street: addressParts[0] || '',
      city: addressParts[1] || '',
      state: addressParts[2] || '',
      zipCode: addressParts[3] || '',
      type: form.type
    };
    
    setForm(newForm);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '3px',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #fc8019 0%, #e6730a 100%)',
        color: 'white',
        textAlign: 'center',
        py: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {address ? 'Edit Address' : 'Add New Address'}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Search Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Quick Address Search
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search for an address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSearchAddress}
                disabled={isSearching || !searchQuery.trim()}
                sx={{ 
                  backgroundColor: '#fc8019',
                  '&:hover': { backgroundColor: '#e6730a' },
                  minWidth: '100px'
                }}
              >
                {isSearching ? <CircularProgress size={20} color="inherit" /> : 'Search'}
              </Button>
            </Box>

            {/* Current Location Button */}
            <Button
              variant="outlined"
              startIcon={isGeocoding ? <CircularProgress size={16} /> : <MyLocation />}
              onClick={handleUseCurrentLocation}
              disabled={isGeocoding || !currentLocation?.lat}
              sx={{ 
                borderColor: '#fc8019',
                color: '#fc8019',
                '&:hover': { 
                  borderColor: '#e6730a',
                  backgroundColor: 'rgba(252,128,25,0.04)'
                }
              }}
            >
              Use Current Location
            </Button>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Search Results:
                </Typography>
                {searchResults.map((result, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      mb: 1
                    }}
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {result.address}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Manual Address Form */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Or enter address manually:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  label="Street Address" 
                  name="street" 
                  value={form.street} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="City" 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  label="State" 
                  name="state" 
                  value={form.state} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={3}>
                <TextField 
                  label="ZIP Code" 
                  name="zipCode" 
                  value={form.zipCode} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Type (Home, Work, etc.)" 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: '#666',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={() => onSave(form)} 
          sx={{ 
            textTransform: 'none', 
            backgroundColor: '#fc8019', 
            '&:hover': { backgroundColor: '#e6730a' } 
          }}
        >
          {address ? 'Update Address' : 'Add Address'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressEditModal;


