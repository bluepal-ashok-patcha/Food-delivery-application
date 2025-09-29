import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close,
  MyLocation,
  CheckCircle,
  Search
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentLocation,
  closeMapModal,
  geocodeLocation
} from '../../store/slices/locationSlice';

// Mock map component (in real app, use Google Maps, Mapbox, etc.)
const MockMap = ({ center, onLocationSelect, selectedLocation }) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [isLoading, setIsLoading] = useState(false);

  const handleMapClick = async (lat, lng) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLocationSelect({ lat, lng });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#f5f5f5', borderRadius: '3px', overflow: 'hidden' }}>
      {/* Mock Map Background */}
      <Box sx={{
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(45deg, #e8f5e8 25%, transparent 25%),
          linear-gradient(-45deg, #e8f5e8 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e8f5e8 75%),
          linear-gradient(-45deg, transparent 75%, #e8f5e8 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        position: 'relative'
      }}>
        {/* Map Grid Lines */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />

        {/* Clickable Areas */}
        {[
          { lat: 17.4065, lng: 78.4772, name: 'Banjara Hills' },
          { lat: 17.4488, lng: 78.3908, name: 'HITEC City' },
          { lat: 17.4333, lng: 78.4167, name: 'Jubilee Hills' },
          { lat: 17.3850, lng: 78.4867, name: 'Secunderabad' },
          { lat: 17.4239, lng: 78.4738, name: 'Gachibowli' },
          { lat: 17.3616, lng: 78.4747, name: 'Charminar' }
        ].map((area, index) => {
          const x = ((area.lng - 78.3) / 0.3) * 100;
          const y = ((17.5 - area.lat) / 0.2) * 100;
          
          return (
            <Box
              key={index}
              onClick={() => handleMapClick(area.lat, area.lng)}
              sx={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: selectedLocation?.lat === area.lat && selectedLocation?.lng === area.lng 
                  ? '#fc8019' 
                  : 'rgba(252, 128, 25, 0.3)',
                border: '2px solid #fc8019',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#fc8019',
                  transform: 'translate(-50%, -50%) scale(1.1)',
                  boxShadow: '0 4px 12px rgba(252, 128, 25, 0.4)'
                }
              }}
            >
              {selectedLocation?.lat === area.lat && selectedLocation?.lng === area.lng ? (
                <CheckCircle sx={{ color: 'white', fontSize: 24 }} />
              ) : (
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }} />
              )}
            </Box>
          );
        })}

        {/* Loading Overlay */}
        {isLoading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <CircularProgress size={40} sx={{ color: '#fc8019' }} />
          </Box>
        )}

        {/* Map Instructions */}
        <Box sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: 2,
          borderRadius: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>
            Click on any area to select location
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const MapSelector = () => {
  const dispatch = useDispatch();
  const { isMapModalOpen, mapCenter, currentLocation } = useSelector((state) => state.location);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (isMapModalOpen) {
      setSelectedLocation(currentLocation);
    }
  }, [isMapModalOpen, currentLocation]);

  const handleLocationSelect = (coordinates) => {
    setSelectedLocation(coordinates);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      dispatch(geocodeLocation(selectedLocation));
      dispatch(closeMapModal());
    }
  };

  const handleDetectCurrentLocation = () => {
    // Mock current location detection
    const mockLocation = {
      lat: 17.4065 + (Math.random() - 0.5) * 0.1,
      lng: 78.4772 + (Math.random() - 0.5) * 0.1
    };
    setSelectedLocation(mockLocation);
  };

  return (
    <Modal
      open={isMapModalOpen}
      onClose={() => dispatch(closeMapModal())}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper sx={{
        width: { xs: '95%', sm: '600px' },
        maxHeight: '90vh',
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
            Select Location on Map
          </Typography>
          <IconButton
            onClick={() => dispatch(closeMapModal())}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Map Container */}
        <Box sx={{ p: 3, flex: 1 }}>
          <MockMap
            center={mapCenter}
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />

          {/* Selected Location Info */}
          {selectedLocation && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: '3px', border: '1px solid #e0e0e0' }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '12px', fontWeight: 600 }}>
                SELECTED LOCATION
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: 3, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<MyLocation />}
            onClick={handleDetectCurrentLocation}
            sx={{
              borderColor: '#fc8019',
              color: '#fc8019',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '3px',
              flex: 1
            }}
          >
            Use Current Location
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmLocation}
            disabled={!selectedLocation}
            sx={{
              backgroundColor: '#fc8019',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '3px',
              flex: 1,
              '&:hover': { backgroundColor: '#e6730a' },
              '&:disabled': { backgroundColor: '#ccc' }
            }}
          >
            Confirm Location
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default MapSelector;
