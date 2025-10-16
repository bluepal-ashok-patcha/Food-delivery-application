import React, { useState } from 'react';
import { Box, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText, Switch } from '@mui/material';
import { FilterList, ArrowDownward, ArrowUpward, SortByAlpha } from '@mui/icons-material';

const SortFilterBar = ({ count, onSelectSort, isPureVeg, onTogglePureVeg, locationEnabled, onToggleNearby }) => {
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
      {/* Left: count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
          {count} restaurants {locationEnabled ? 'nearby (20km)' : 'available'}
        </Typography>
      </Box>
      {/* Right: Pure Veg toggle + Nearby toggle + Filter button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '16px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
          <Switch 
            checked={!!isPureVeg} 
            onChange={(e) => onTogglePureVeg?.(e.target.checked)} 
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#2ea44f' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2ea44f' },
              '& .MuiSwitch-track': { backgroundColor: '#d0d7de' }
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>Pure Veg</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '16px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
          <Switch 
            checked={!!locationEnabled} 
            onChange={() => onToggleNearby?.()} 
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#0ea5e9' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0ea5e9' },
              '& .MuiSwitch-track': { backgroundColor: '#d0d7de' }
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '13px' }}>Nearby</Typography>
        </Box>
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


