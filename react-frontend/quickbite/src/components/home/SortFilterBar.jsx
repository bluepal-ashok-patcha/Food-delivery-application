import React from 'react';
import { Box, Typography } from '@mui/material';
import { FilterList, Sort } from '@mui/icons-material';
import Button from '../common/Button';

const SortFilterBar = ({ count, onToggleFilters }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, py: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
      {count} restaurants near you
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        onClick={onToggleFilters}
        sx={{ borderColor: '#e0e0e0', color: '#333', textTransform: 'none', fontWeight: 500, borderRadius: '3px', px: 2, py: 1, fontSize: '13px', '&:hover': { borderColor: '#fc8019', backgroundColor: '#fff5f0' }, transition: 'all 0.2s ease' }}
      >
        Filters
      </Button>
      <Button
        variant="outlined"
        startIcon={<Sort />}
        sx={{ borderColor: '#e0e0e0', color: '#333', textTransform: 'none', fontWeight: 500, borderRadius: '3px', px: 2, py: 1, fontSize: '13px', '&:hover': { borderColor: '#fc8019', backgroundColor: '#fff5f0' }, transition: 'all 0.2s ease' }}
      >
        Sort
      </Button>
    </Box>
  </Box>
);

export default SortFilterBar;


