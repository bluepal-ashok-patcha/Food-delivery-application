import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Close,
  MyLocation,
  CheckCircle,
  Search,
  LocationOn
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentLocation,
  closeMapModal,
  geocodeLocation,
  reverseGeocodeLocation,
  setSelectedCoordinates
} from '../../store/slices/locationSlice';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = '#fc8019') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-size: 16px;
          transform: rotate(45deg);
          font-weight: bold;
        ">📍</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Map click handler component
const MapClickHandler = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });
  return null;
};

// Current location marker component
const CurrentLocationMarker = ({ position, isDetecting }) => {
  if (!position) return null;
  
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={createCustomIcon('#4caf50')}
    >
      <Popup>
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
            Current Location
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </Typography>
        </Box>
      </Popup>
    </Marker>
  );
};

// Selected location marker component
const SelectedLocationMarker = ({ position }) => {
  if (!position) return null;
  
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={createCustomIcon('#fc8019')}
    >
      <Popup>
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#fc8019' }}>
            Selected Location
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </Typography>
        </Box>
      </Popup>
    </Marker>
  );
};

const AccurateMapSelector = () => {
  const dispatch = useDispatch();
  const { isMapModalOpen, mapCenter, currentLocation } = useSelector((state) => state.location);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

 useEffect(() => {
  if (isMapModalOpen) {
    setSelectedLocation(currentLocation);

    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: true });
        mapRef.current.setView(
          [currentLocation.lat, currentLocation.lng],
          13,
          { animate: true }
        );
      }
    }, 500); // increase delay so modal animation finishes

    return () => clearTimeout(timer);
  }
}, [isMapModalOpen, currentLocation]);


  const handleLocationSelect = (coordinates) => {
    setSelectedLocation(coordinates);
    if (coordinates?.lat && coordinates?.lng) {
      dispatch(setSelectedCoordinates({ lat: coordinates.lat, lng: coordinates.lng }));
    }
  };

  const handleDetectCurrentLocation = () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = { lat: latitude, lng: longitude };
        
        setCurrentPosition(newPosition);
        setSelectedLocation(newPosition);
        setIsDetectingLocation(false);
        
        // Update map center to current location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        alert(errorMessage);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await dispatch(reverseGeocodeLocation(searchQuery));
      // The location will be updated via Redux
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      dispatch(setSelectedCoordinates({ lat: selectedLocation.lat, lng: selectedLocation.lng }));
      dispatch(geocodeLocation(selectedLocation));
      dispatch(closeMapModal());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchLocation();
    }
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
        width: { xs: '95%', sm: '800px' },
        height: { xs: '90vh', sm: '600px' },
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
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 3
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

        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', position: 'relative', zIndex: 3, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
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
                  height: '40px',
                  fontSize: '14px',
                  '& fieldset': { borderColor: '#e0e0e0' },
                  '&:hover fieldset': { borderColor: '#fc8019' },
                  '&.Mui-focused fieldset': { borderColor: '#fc8019' }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearchLocation}
              disabled={!searchQuery.trim() || isSearching}
              startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
              sx={{
                backgroundColor: '#fc8019',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '3px',
                px: 3,
                '&:hover': { backgroundColor: '#e6730a' }
              }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={isDetectingLocation ? <CircularProgress size={20} /> : <MyLocation />}
            onClick={handleDetectCurrentLocation}
            disabled={isDetectingLocation}
            sx={{
              borderColor: '#4caf50',
              color: '#4caf50',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '3px',
              '&:hover': {
                borderColor: '#388e3c',
                backgroundColor: '#e8f5e8'
              }
            }}
          >
            {isDetectingLocation ? 'Detecting...' : 'Use Current Location'}
          </Button>
        </Box>

        {/* Map Container */}
        <Box sx={{ flex: 1, position: 'relative', cursor: 'crosshair', overflow: 'hidden', zIndex: 1 }}>
          {/* <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1, outline: 'none' }}
            whenCreated={(mapInstance) => { mapRef.current = mapInstance; setTimeout(() => mapInstance.invalidateSize(), 0); }}
          > */}
          <MapContainer
  center={[mapCenter.lat, mapCenter.lng]}
  zoom={13}
  style={{ height: '100%', width: '100%', outline: 'none' }}
  whenCreated={(mapInstance) => {
    mapRef.current = mapInstance;
    setTimeout(() => mapInstance.invalidateSize(), 500); // ensure resize after modal animation
  }}
>

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler 
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
            
            <CurrentLocationMarker 
              position={currentPosition}
              isDetecting={isDetectingLocation}
            />
            
            <SelectedLocationMarker 
              position={selectedLocation}
            />
          </MapContainer>
        </Box>

        {/* Selected Location Info */}
        {selectedLocation && (
          <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', backgroundColor: '#f8f9fa', position: 'relative', zIndex: 3 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 1, fontSize: '12px', fontWeight: 600 }}>
              SELECTED LOCATION
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ p: 3, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 2, position: 'relative', zIndex: 3, backgroundColor: 'white' }}>
          <Button
            variant="outlined"
            onClick={() => dispatch(closeMapModal())}
            sx={{
              borderColor: '#e0e0e0',
              color: '#666',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '3px',
              flex: 1
            }}
          >
            Cancel
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

export default AccurateMapSelector;
