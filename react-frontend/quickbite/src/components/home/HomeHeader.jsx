import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { LocationOn, Search, MyLocation, LocationOff } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { userAPI } from '../../services/api';

const HomeHeader = ({ searchQuery, setSearchQuery, onSearch, userLocation, onLocationToggle, locationEnabled }) => {
  const { currentLocation } = useSelector((state) => state.location);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const lastSyncRef = useRef({ lat: null, lng: null });

  useEffect(() => {
    const { lat, lng } = currentLocation || {};
    if (lat == null || lng == null) return;
    // Only update location if user is authenticated
    if (!isAuthenticated) return;
    
    // Prevent noisy updates for small changes
    const prev = lastSyncRef.current;
    const changed = prev.lat !== lat || prev.lng !== lng;
    if (!changed) return;
    lastSyncRef.current = { lat, lng };
    // Fire-and-forget update to user profile location
    userAPI.updateLocation(lat, lng).catch(() => {});
  }, [currentLocation?.lat, currentLocation?.lng, isAuthenticated]);
  
  const shortAddress = (() => {
    const full = currentLocation?.address || '';
    if (!full) return 'Your location';
    const parts = full.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
    return parts[0] || 'Your location';
  })();

  return (
    <Box sx={{ backgroundColor: '#fc8019', color: 'white', py: 2, mb: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <LocationOn sx={{ mr: 1, fontSize: 18, color: 'white' }} />
            <Typography noWrap variant="body2" sx={{ fontWeight: 500, fontSize: '14px', color: 'white', maxWidth: '60%' }}>
              Deliver to: {shortAddress}
            </Typography>
          </Box>
          
          {/* Location Toggle Button */}
          <Tooltip title={locationEnabled ? "Disable nearby search" : "Enable nearby search"}>
            <IconButton
              onClick={onLocationToggle}
              sx={{
                color: 'white',
                backgroundColor: locationEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
                width: 36,
                height: 36,
                ml: 1
              }}
            >
              {locationEnabled ? <MyLocation sx={{ fontSize: 20 }} /> : <LocationOff sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      <Box sx={{ maxWidth: 600 }}>
        <TextField
          fullWidth
          placeholder="Search for restaurants or food..."
          value={searchQuery}
          onChange={(e) => { const v = e.target.value; setSearchQuery(v); }}
          onKeyPress={(e) => { if (e.key === 'Enter') { onSearch(searchQuery); } }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#666', fontSize: 18 }} /></InputAdornment>) }}
          sx={{ backgroundColor: 'white', borderRadius: '3px', '& .MuiOutlinedInput-root': { borderRadius: '3px', height: '40px', fontSize: '14px', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: 'transparent' }, '&.Mui-focused fieldset': { borderColor: 'transparent' } } }}
        />
      </Box>
    </Container>
  </Box>
  );
};

export default HomeHeader;


