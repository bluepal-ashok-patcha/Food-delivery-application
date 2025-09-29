import React from 'react';
import { Box, Container, Typography, TextField, InputAdornment } from '@mui/material';
import { LocationOn, Search } from '@mui/icons-material';

const HomeHeader = ({ searchQuery, setSearchQuery, onSearch }) => (
  <Box sx={{ backgroundColor: '#fc8019', color: 'white', py: 3, mb: 3 }}>
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocationOn sx={{ mr: 1, fontSize: 20, color: 'white' }} />
        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px', color: 'white' }}>
          Deliver to: 123 Main St, City
        </Typography>
      </Box>
      <Box sx={{ maxWidth: 600 }}>
        <TextField
          fullWidth
          placeholder="Search for restaurants or food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#666', fontSize: 20 }} /></InputAdornment>) }}
          sx={{ backgroundColor: 'white', borderRadius: '8px', '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '40px', fontSize: '14px', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: 'transparent' }, '&.Mui-focused fieldset': { borderColor: 'transparent' } } }}
        />
      </Box>
    </Container>
  </Box>
);

export default HomeHeader;


