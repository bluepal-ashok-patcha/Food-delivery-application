import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Close,
  LocationOn,
  MyLocation,
  Search,
  CheckCircle
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentLocation,
  closeLocationModal,
  openMapModal,
  detectCurrentLocation,
  reverseGeocodeLocation
} from '../../store/slices/locationSlice';

const LocationModal = () => {
  const dispatch = useDispatch();
  const {
    currentLocation,
    isDetectingLocation,
    isReverseGeocoding,
    locationError,
    isLocationModalOpen
  } = useSelector((state) => state.location);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isLocationModalOpen) {
      setSearchQuery('');
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

      </Paper>
    </Modal>
  );
};

export default LocationModal;
