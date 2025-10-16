import React from 'react';
import { Box, Container, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const HomeHeader = ({ searchQuery, setSearchQuery, onSearch }) => {
  return (
    <Box sx={{ backgroundColor: '#fc8019', color: 'white', py: 2, mb: 2 }}>
      <Container maxWidth="lg">
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


