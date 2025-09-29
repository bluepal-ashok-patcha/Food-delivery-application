import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

const CategoriesBar = ({ title = 'Popular Categories', categories, activeCuisine, onSelect }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2, fontSize: '18px' }}>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={`${category.icon} ${category.name}`}
          onClick={() => onSelect(category.name)}
          variant={activeCuisine === category.name ? 'filled' : 'outlined'}
          sx={{
            backgroundColor: activeCuisine === category.name ? '#fc8019' : 'white',
            color: activeCuisine === category.name ? 'white' : '#333',
            borderColor: '#e0e0e0',
            fontWeight: 500,
            fontSize: '13px',
            height: '32px',
            borderRadius: '16px',
            px: 2,
            '&:hover': { backgroundColor: activeCuisine === category.name ? '#e6730a' : '#f8f9fa' },
            transition: 'all 0.2s ease',
          }}
        />
      ))}
    </Box>
  </Box>
);

export default CategoriesBar;


