import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Close,
  LocationOn,
  Home,
  Work,
  Add,
  Edit,
  Delete,
  MyLocation,
  Search,
  CheckCircle
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentLocation,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  closeLocationModal,
  openMapModal,
  detectCurrentLocation,
  geocodeLocation,
  reverseGeocodeLocation
} from '../../store/slices/locationSlice';

const LocationModal = () => {
  const dispatch = useDispatch();
  const {
    currentLocation,
    savedAddresses,
    isDetectingLocation,
    isGeocoding,
    isReverseGeocoding,
    locationError,
    isLocationModalOpen
  } = useSelector((state) => state.location);

  const [searchQuery, setSearchQuery] = useState('');
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    type: 'home'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (isLocationModalOpen) {
      setSearchQuery('');
      setNewAddress({ name: '', address: '', type: 'home' });
      setShowAddForm(false);
      setEditingAddress(null);
    }
  }, [isLocationModalOpen]);

  const handleDetectLocation = () => {
    dispatch(detectCurrentLocation());
  };

  const handleManualLocation = () => {
    if (searchQuery.trim()) {
      dispatch(reverseGeocodeLocation(searchQuery));
    }
  };

  const handleOpenMap = () => {
    dispatch(openMapModal());
  };

  const handleSelectAddress = (address) => {
    dispatch(setCurrentLocation({
      lat: address.coordinates.lat,
      lng: address.coordinates.lng,
      address: address.address
    }));
    dispatch(closeLocationModal());
  };

  const handleAddAddress = () => {
    if (newAddress.name.trim() && newAddress.address.trim()) {
      const mockCoords = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      };
      
      dispatch(addSavedAddress({
        ...newAddress,
        coordinates: mockCoords
      }));
      
      setNewAddress({ name: '', address: '', type: 'home' });
      setShowAddForm(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress({
      name: address.name,
      address: address.address,
      type: address.type
    });
    setShowAddForm(true);
  };

  const handleUpdateAddress = () => {
    if (editingAddress && newAddress.name.trim() && newAddress.address.trim()) {
      dispatch(updateSavedAddress({
        id: editingAddress.id,
        updates: newAddress
      }));
      setEditingAddress(null);
      setNewAddress({ name: '', address: '', type: 'home' });
      setShowAddForm(false);
    }
  };

  const handleDeleteAddress = (id) => {
    dispatch(deleteSavedAddress(id));
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id));
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home sx={{ color: '#fc8019' }} />;
      case 'work':
        return <Work sx={{ color: '#2196f3' }} />;
      default:
        return <LocationOn sx={{ color: '#666' }} />;
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'home':
        return '#fc8019';
      case 'work':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  const filteredAddresses = savedAddresses.filter(addr =>
    addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      open={isLocationModalOpen}
      onClose={() => dispatch(closeLocationModal())}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: 2,
        pt: 4
      }}
    >
      <Paper sx={{
        width: { xs: '95%', sm: '500px' },
        maxHeight: '80vh',
        borderRadius: '3px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{
          p: 3,
          backgroundColor: '#fc8019',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
            Choose your location
          </Typography>
          <IconButton
            onClick={() => dispatch(closeLocationModal())}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 3, pb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search for area, street name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#666', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '3px',
                height: '44px',
                fontSize: '14px',
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#fc8019' },
                '&.Mui-focused fieldset': { borderColor: '#fc8019' }
              }
            }}
          />
        </Box>

        {/* Location Options */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={isDetectingLocation ? <CircularProgress size={20} /> : <MyLocation />}
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              sx={{
                borderColor: '#fc8019',
                color: '#fc8019',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '3px',
                py: 1.5,
                fontSize: '14px',
                '&:hover': {
                  borderColor: '#e6730a',
                  backgroundColor: '#fff5f0'
                }
              }}
            >
              {isDetectingLocation ? 'Detecting...' : 'Current Location'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Search />}
              onClick={handleOpenMap}
              sx={{
                borderColor: '#2196f3',
                color: '#2196f3',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '3px',
                py: 1.5,
                fontSize: '14px',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              Select on Map
            </Button>
          </Box>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleManualLocation}
            disabled={!searchQuery.trim() || isReverseGeocoding}
            startIcon={isReverseGeocoding ? <CircularProgress size={20} /> : <Search />}
            sx={{
              borderColor: '#4caf50',
              color: '#4caf50',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '3px',
              py: 1.5,
              fontSize: '14px',
              '&:hover': {
                borderColor: '#388e3c',
                backgroundColor: '#e8f5e8'
              }
            }}
          >
            {isReverseGeocoding ? 'Searching...' : 'Search Address'}
          </Button>
        </Box>

        {/* Error Alert */}
        {locationError && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: '3px', fontSize: '13px' }}>
              {locationError}
            </Alert>
          </Box>
        )}

        {/* Current Location */}
        {currentLocation && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '12px', fontWeight: 600 }}>
              CURRENT LOCATION
            </Typography>
            <Paper sx={{
              p: 2,
              border: '2px solid #fc8019',
              borderRadius: '3px',
              backgroundColor: '#fff5f0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#fc8019', fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px' }}>
                  {currentLocation.address}
                </Typography>
                <CheckCircle sx={{ color: '#4caf50', fontSize: 18, ml: 'auto' }} />
              </Box>
            </Paper>
          </Box>
        )}

        <Divider />

        {/* Saved Addresses */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '12px', fontWeight: 600 }}>
                SAVED ADDRESSES
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={() => setShowAddForm(true)}
                sx={{
                  color: '#fc8019',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  '&:hover': { backgroundColor: '#fff5f0' }
                }}
              >
                Add new
              </Button>
            </Box>

            {/* Add/Edit Form */}
            {showAddForm && (
              <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '3px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, fontSize: '14px' }}>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </Typography>
                
                <TextField
                  fullWidth
                  placeholder="Address name (e.g., Home, Office)"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '3px', fontSize: '14px' } }}
                />
                
                <TextField
                  fullWidth
                  placeholder="Complete address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '3px', fontSize: '14px' } }}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                    disabled={!newAddress.name.trim() || !newAddress.address.trim()}
                    sx={{
                      backgroundColor: '#fc8019',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '3px',
                      fontSize: '13px',
                      '&:hover': { backgroundColor: '#e6730a' }
                    }}
                  >
                    {editingAddress ? 'Update' : 'Add'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                      setNewAddress({ name: '', address: '', type: 'home' });
                    }}
                    sx={{
                      borderColor: '#e0e0e0',
                      color: '#666',
                      textTransform: 'none',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Address List */}
            <List sx={{ p: 0 }}>
              {filteredAddresses.map((address) => (
                <ListItem key={address.id} sx={{ p: 0, mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleSelectAddress(address)}
                    sx={{
                      p: 2,
                      borderRadius: '3px',
                      border: '1px solid #f0f0f0',
                      '&:hover': {
                        backgroundColor: '#fff5f0',
                        borderColor: '#fc8019'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getAddressIcon(address.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px' }}>
                            {address.name}
                          </Typography>
                          {address.isDefault && (
                            <Chip
                              label="Default"
                              size="small"
                              sx={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontSize: '10px',
                                height: 20,
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '13px', mt: 0.5 }}>
                          {address.address}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!address.isDefault && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                          sx={{ color: '#fc8019' }}
                        >
                          <CheckCircle sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                        sx={{ color: '#666' }}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {filteredAddresses.length === 0 && !showAddForm && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
                  No saved addresses found
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default LocationModal;
