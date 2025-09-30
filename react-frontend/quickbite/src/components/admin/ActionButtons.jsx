import React, { useState } from 'react';
import { Stack, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Visibility, Edit, Delete, MoreVert } from '@mui/icons-material';

const ActionButtons = ({ showDelete = true, showMore = true, onView, onEdit, onDelete, onMore, menuOnly = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    if (onMore) onMore(event);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  if (menuOnly) {
    return (
      <>
        <IconButton 
          size="small"
          sx={{ color: '#666', '&:hover': { backgroundColor: '#f5f5f5' } }}
          onClick={handleOpenMenu}
        >
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} elevation={2}>
          <MenuItem onClick={() => { handleCloseMenu(); onView && onView(); }}>
            <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
            <ListItemText primary="View" />
          </MenuItem>
          <MenuItem onClick={() => { handleCloseMenu(); onEdit && onEdit(); }}>
            <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          {showDelete && (
            <MenuItem onClick={() => { handleCloseMenu(); onDelete && onDelete(); }}>
              <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      <IconButton 
        size="small"
        sx={{ 
          color: '#2196f3',
          '&:hover': { backgroundColor: '#e3f2fd' }
        }}
        onClick={onView}
      >
        <Visibility />
      </IconButton>
      <IconButton 
        size="small"
        sx={{ 
          color: '#ff9800',
          '&:hover': { backgroundColor: '#fff3e0' }
        }}
        onClick={onEdit}
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
          onClick={onDelete}
        >
          <Delete />
        </IconButton>
      )}
      {showMore && (
        <>
          <IconButton 
            size="small"
            sx={{ color: '#666', '&:hover': { backgroundColor: '#f5f5f5' } }}
            onClick={handleOpenMenu}
          >
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} elevation={2}>
            <MenuItem onClick={() => { handleCloseMenu(); onView && onView(); }}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <ListItemText primary="View" />
            </MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); onEdit && onEdit(); }}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            {showDelete && (
              <MenuItem onClick={() => { handleCloseMenu(); onDelete && onDelete(); }}>
                <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                <ListItemText primary="Delete" />
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </Stack>
  );
};

export default ActionButtons;
