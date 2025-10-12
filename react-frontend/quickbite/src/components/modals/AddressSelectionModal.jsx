import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Add,
  Search,
  MyLocation,
  Home,
  Work,
  Edit,
  Delete
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { userAPI } from '../../services/api';
import { showNotification } from '../../store/slices/uiSlice';
import { reverseGeocodeLocation, geocodeLocation } from '../../store/slices/locationSlice';

const AddressSelectionModal = ({ open, onClose, onSelectAddress, selectedAddressId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentLocation } = useSelector((state) => state.location);
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'Home'
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Load user addresses when modal opens
  useEffect(() => {
    if (open && user?.id) {
      loadAddresses();
    }
  }, [open, user?.id]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const profile = response?.data || response;
      setAddresses(profile?.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      dispatch(showNotification({
        message: 'Failed to load addresses',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await dispatch(reverseGeocodeLocation(searchQuery)).unwrap();
      setSearchResults([result]);
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
      const newAddr = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || '',
        type: 'Home',
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      };
      
      setNewAddress(newAddr);
      setShowAddForm(true);
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to get address from current location',
        type: 'error'
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      dispatch(showNotification({
        message: 'Please fill in all address fields',
        type: 'error'
      }));
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.addAddress(newAddress);
      const addedAddress = response?.data || response;
      
      setAddresses(prev => [...prev, addedAddress]);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', type: 'Home' });
      setShowAddForm(false);
      setSearchQuery('');
      setSearchResults([]);
      
      dispatch(showNotification({
        message: 'Address added successfully!',
        type: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to add address',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    onSelectAddress(address);
    onClose();
  };

  const handleSelectSearchResult = async (result) => {
    try {
      setIsGeocoding(true);
      
      // Parse the address into components
      const addressParts = result.address.split(',').map(s => s.trim());
      const newAddr = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || '',
        type: 'Home',
        latitude: result.lat,
        longitude: result.lng
      };
      
      setNewAddress(newAddr);
      setShowAddForm(true);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to process selected address',
        type: 'error'
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Home sx={{ color: '#fc8019' }} />;
      case 'work':
        return <Work sx={{ color: '#2196f3' }} />;
      default:
        return <LocationOn sx={{ color: '#666' }} />;
    }
  };

  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
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
          Select Delivery Address
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Search Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Search for a new address
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Enter address to search..."
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
            {searchResults.length > 0 && (
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

          <Divider />

          {/* Saved Addresses */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Saved Addresses
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setShowAddForm(true)}
                size="small"
                sx={{ 
                  borderColor: '#fc8019',
                  color: '#fc8019',
                  '&:hover': { 
                    borderColor: '#e6730a',
                    backgroundColor: 'rgba(252,128,25,0.04)'
                  }
                }}
              >
                Add New
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : addresses.length === 0 ? (
              <Alert severity="info">
                No saved addresses found. Add an address to get started.
              </Alert>
            ) : (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedAddressId || ''}
                  onChange={(e) => {
                    const address = addresses.find(addr => addr.id.toString() === e.target.value);
                    if (address) handleSelectAddress(address);
                  }}
                >
                  {addresses.map((address) => (
                    <FormControlLabel
                      key={address.id}
                      value={address.id.toString()}
                      control={<Radio sx={{ color: '#fc8019' }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          {getAddressIcon(address.type)}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatAddress(address)}
                            </Typography>
                            {address.type && (
                              <Chip 
                                label={address.type} 
                                size="small" 
                                sx={{ 
                                  mt: 0.5,
                                  backgroundColor: address.type.toLowerCase() === 'home' ? '#fc8019' : '#2196f3',
                                  color: 'white',
                                  fontSize: '10px',
                                  height: '20px'
                                }} 
                              />
                            )}
                            {address.isDefault && (
                              <Chip 
                                label="Default" 
                                size="small" 
                                sx={{ 
                                  mt: 0.5, ml: 1,
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  fontSize: '10px',
                                  height: '20px'
                                }} 
                              />
                            )}
                          </Box>
                        </Box>
                      }
                      sx={{ 
                        width: '100%',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        p: 1,
                        mb: 1,
                        '&:hover': { backgroundColor: '#f5f5f5' }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>

          {/* Add Address Form */}
          {showAddForm && (
            <Box sx={{ 
              p: 2, 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Add New Address
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Street Address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="ZIP Code"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAddress({ street: '', city: '', state: '', zipCode: '', type: 'Home' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddAddress}
                    disabled={loading}
                    sx={{ 
                      backgroundColor: '#fc8019',
                      '&:hover': { backgroundColor: '#e6730a' }
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Add Address'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
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
      </DialogActions>
    </Dialog>
  );
};

export default AddressSelectionModal;
