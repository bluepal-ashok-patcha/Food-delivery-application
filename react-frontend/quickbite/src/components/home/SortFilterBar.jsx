import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { FilterList, ArrowDownward, ArrowUpward, SortByAlpha } from '@mui/icons-material';

const SortFilterBar = ({ count, onSelectSort }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const pick = (sortBy, sortDir) => {
    onSelectSort?.({ sortBy, sortDir });
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, py: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
        {count} restaurants near you
      </Typography>
      <Box>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleOpen}
          sx={{ borderColor: '#e0e0e0', color: '#333', textTransform: 'none', fontWeight: 500, borderRadius: '3px', px: 2, py: 1, fontSize: '13px', '&:hover': { borderColor: '#fc8019', backgroundColor: '#fff5f0' }, transition: 'all 0.2s ease' }}
        >
          Filter & Sort
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={() => pick('rating', 'desc')}>
            <ListItemIcon><ArrowDownward fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ratings: High to Low" />
          </MenuItem>
          <MenuItem onClick={() => pick('rating', 'asc')}>
            <ListItemIcon><ArrowUpward fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ratings: Low to High" />
          </MenuItem>
          <MenuItem onClick={() => pick('deliveryFee', 'desc')}>
            <ListItemIcon><ArrowDownward fontSize="small" /></ListItemIcon>
            <ListItemText primary="Delivery Fee: High to Low" />
          </MenuItem>
          <MenuItem onClick={() => pick('deliveryFee', 'asc')}>
            <ListItemIcon><ArrowUpward fontSize="small" /></ListItemIcon>
            <ListItemText primary="Delivery Fee: Low to High" />
          </MenuItem>
          <MenuItem onClick={() => pick('name', 'asc')}>
            <ListItemIcon><SortByAlpha fontSize="small" /></ListItemIcon>
            <ListItemText primary="Name: A to Z" />
          </MenuItem>
          <MenuItem onClick={() => pick('name', 'desc')}>
            <ListItemIcon><SortByAlpha fontSize="small" /></ListItemIcon>
            <ListItemText primary="Name: Z to A" />
          </MenuItem>
          <MenuItem onClick={() => pick(undefined, undefined)}>
            <ListItemIcon><FilterList fontSize="small" /></ListItemIcon>
            <ListItemText primary="Clear Sorting" />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default SortFilterBar;


