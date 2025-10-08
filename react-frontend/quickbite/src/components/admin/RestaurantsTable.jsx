import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip, Button, Switch } from '@mui/material';
import { Restaurant, LocationOn, Star, CheckCircle, Cancel } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const RestaurantsTable = ({ restaurants, onViewRestaurant, onEditRestaurant, onDeleteRestaurant, onToggleActive, onToggleOpen, onApprove, onReject }) => {
  return (
    <TableContainer sx={{ 
      borderRadius: '4px',
      border: '1px solid #e0e0e0',
      background: '#fff'
    }}>
      <Table>
        <TableHead sx={{ background: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Restaurant</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Cuisine</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Rating</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Open</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Active</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow 
              key={restaurant.id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    width: 50, 
                    height: 50,
                    background: '#fc8019',
                    fontWeight: 700
                  }}>
                    <Restaurant />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                      {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 14, color: '#666' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {restaurant.address}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontWeight: 500,
                  fontSize: '13px',
                  textTransform: 'capitalize'
                }}>
                  {restaurant.cuisineType || restaurant.cuisine || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 18, color: '#ffc107' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                    {restaurant.rating}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={restaurant.isOpen}
                    onChange={() => onToggleOpen && onToggleOpen(restaurant)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ 
                    color: restaurant.isOpen ? '#4caf50' : '#666',
                    fontWeight: 500,
                    fontSize: '13px'
                  }}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={restaurant.isActive}
                    onChange={() => onToggleActive && onToggleActive(restaurant)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2196f3',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2196f3',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ 
                    color: restaurant.isActive ? '#2196f3' : '#666',
                    fontWeight: 500,
                    fontSize: '13px'
                  }}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ 
                    color: '#333',
                    fontWeight: 500,
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}>
                    {(restaurant.status || '').toString().replace('_', ' ') || '—'}
                  </Typography>
                  {(restaurant.status === 'PENDING_APPROVAL') && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => onApprove && onApprove(restaurant)}
                        sx={{ 
                          fontSize: '11px',
                          px: 1.5,
                          py: 0.5,
                          textTransform: 'none',
                          backgroundColor: '#4caf50',
                          '&:hover': { backgroundColor: '#388e3c' }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => onReject && onReject(restaurant)}
                        sx={{ 
                          fontSize: '11px',
                          px: 1.5,
                          py: 0.5,
                          textTransform: 'none',
                          borderColor: '#f44336',
                          color: '#f44336',
                          '&:hover': { 
                            borderColor: '#d32f2f',
                            backgroundColor: 'rgba(244, 67, 54, 0.04)'
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <ActionButtons 
                  menuOnly
                  onView={() => onViewRestaurant && onViewRestaurant(restaurant)}
                  onEdit={() => onEditRestaurant && onEditRestaurant(restaurant)}
                  onDelete={() => onDeleteRestaurant && onDeleteRestaurant(restaurant)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RestaurantsTable;
