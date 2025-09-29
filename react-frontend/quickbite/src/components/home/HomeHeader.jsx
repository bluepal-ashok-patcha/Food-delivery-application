import React from 'react';
import { Box, Container, Typography, TextField, InputAdornment } from '@mui/material';
import { LocationOn, Search } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const HomeHeader = ({ searchQuery, setSearchQuery, onSearch }) => {
  const { currentLocation } = useSelector((state) => state.location);
  
  return (
    <Box sx={{ backgroundColor: '#fc8019', color: 'white', py: 2, mb: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ mr: 1, fontSize: 18, color: 'white' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px', color: 'white' }}>
            Deliver to: {currentLocation?.address || '123 Main St, City'}
          </Typography>
        </Box>
      <Box sx={{ maxWidth: 600 }}>
        <TextField
          fullWidth
          placeholder="Search for restaurants or food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#666', fontSize: 18 }} /></InputAdornment>) }}
          sx={{ backgroundColor: 'white', borderRadius: '3px', '& .MuiOutlinedInput-root': { borderRadius: '3px', height: '40px', fontSize: '14px', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: 'transparent' }, '&.Mui-focused fieldset': { borderColor: 'transparent' } } }}
        />
      </Box>
    </Container>
  </Box>
  );
};

export default HomeHeader;


