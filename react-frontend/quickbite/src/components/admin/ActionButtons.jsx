import React from 'react';
import { Stack, IconButton } from '@mui/material';
import { Visibility, Edit, Delete, MoreVert } from '@mui/icons-material';

const ActionButtons = ({ showDelete = true, showMore = true }) => {
  return (
    <Stack direction="row" spacing={1}>
      <IconButton 
        size="small"
        sx={{ 
          color: '#2196f3',
          '&:hover': { backgroundColor: '#e3f2fd' }
        }}
      >
        <Visibility />
      </IconButton>
      <IconButton 
        size="small"
        sx={{ 
          color: '#ff9800',
          '&:hover': { backgroundColor: '#fff3e0' }
        }}
      >
        <Edit />
      </IconButton>
      {showDelete && (
        <IconButton 
          size="small" 
          sx={{ 
            color: '#f44336',
            '&:hover': { backgroundColor: '#ffebee' }
          }}
        >
          <Delete />
        </IconButton>
      )}
      {showMore && (
        <IconButton 
          size="small"
          sx={{ 
            color: '#666',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <MoreVert />
        </IconButton>
      )}
    </Stack>
  );
};

export default ActionButtons;
