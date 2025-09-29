import React from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import { LocationOn, Delete } from '@mui/icons-material';

const AddressItem = ({ address, onSetDefault, onDelete }) => (
  <Box sx={{ mb: 1.5 }}>
    <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOn sx={{ color: 'text.secondary', fontSize: '18px' }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '14px' }}>{address.address}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
            {address.isDefault && ' • Default'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {!address.isDefault && (
          <Button size="small" onClick={onSetDefault} sx={{ fontSize: '11px', px: 1, py: 0.5 }}>Set Default</Button>
        )}
        <IconButton color="error" onClick={onDelete} size="small" sx={{ width: '28px', height: '28px' }}>
          <Delete sx={{ fontSize: '16px' }} />
        </IconButton>
      </Box>
    </Paper>
  </Box>
);

export default AddressItem;


