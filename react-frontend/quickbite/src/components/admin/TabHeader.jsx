import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Add } from '@mui/icons-material';

const TabHeader = ({ title, subtitle, showAddButton = true, addButtonText = "Add Item", onAddClick }) => {
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
            onClick={onAddClick}
          >
            {addButtonText}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default TabHeader;
