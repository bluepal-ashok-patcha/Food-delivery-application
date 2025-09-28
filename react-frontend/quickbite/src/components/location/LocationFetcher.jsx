import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { MyLocation, EditLocation } from '@mui/icons-material';
import { setLocationSuccess, setLocationStart, setLocationFailure } from '../../store/slices/locationSlice';
import { closeLocationModal } from '../../store/slices/uiSlice';

const LocationFetcher = () => {
  const dispatch = useDispatch();
  const [manualAddress, setManualAddress] = useState('');

  const handleDetectLocation = () => {
    dispatch(setLocationStart());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock geocoding
          setTimeout(() => {
            const newLocation = {
              address: 'Detected: 456 Oak Avenue',
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            dispatch(setLocationSuccess(newLocation));
            dispatch(closeLocationModal());
          }, 1000);
        },
        (err) => {
          dispatch(setLocationFailure('Could not access your location.'));
        }
      );
    } else {
      dispatch(setLocationFailure('Geolocation is not supported.'));
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      const newLocation = {
        address: manualAddress,
        lat: null, // In a real app, you'd geocode this
        lng: null,
      };
      dispatch(setLocationSuccess(newLocation));
      dispatch(closeLocationModal());
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fff' }}>
      <Typography variant="h6" gutterBottom>
        Select Your Location
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {location && !manualInput && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography>{location}</Typography>
          <Button startIcon={<EditLocation />} onClick={() => setManualInput(true)}>
            Change
          </Button>
        </Box>
      )}
      {!location || manualInput ? (
        <Box>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <MyLocation />}
            onClick={handleDetectLocation}
            disabled={loading}
            fullWidth
            sx={{ mb: 2 }}
          >
            {loading ? 'Detecting...' : 'Use Current Location'}
          </Button>
          <form onSubmit={handleManualSubmit}>
            <TextField
              name="address"
              label="Or enter your address manually"
              variant="outlined"
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
              Find Food
            </Button>
          </form>
        </Box>
      ) : null}
    </Box>
  );
};

export default LocationFetcher;