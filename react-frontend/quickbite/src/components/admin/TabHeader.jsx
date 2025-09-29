import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Search, FilterList, Add } from '@mui/icons-material';

const TabHeader = ({ title, subtitle, showAddButton = true, addButtonText = "Add Item" }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          {subtitle}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<Search />}
          sx={{
            borderColor: '#e0e0e0',
            color: '#666',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '4px',
            px: 3
          }}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          sx={{
            borderColor: '#e0e0e0',
            color: '#666',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '4px',
            px: 3
          }}
        >
          Filter
        </Button>
        {showAddButton && (
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: '#fc8019',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '4px',
              px: 3,
              '&:hover': {
                background: '#e6730a'
              }
            }}
          >
            {addButtonText}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default TabHeader;
