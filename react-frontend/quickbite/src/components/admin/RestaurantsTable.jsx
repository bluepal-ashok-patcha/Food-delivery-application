import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip } from '@mui/material';
import { Restaurant, LocationOn, Star } from '@mui/icons-material';
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
                <Chip 
                  label={restaurant.cuisineType || restaurant.cuisine || '—'} 
                  sx={{
                    background: '#fc8019',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
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
                <Chip 
                  label={restaurant.isOpen ? 'Open' : 'Closed'} 
                  onClick={() => onToggleOpen && onToggleOpen(restaurant)}
                  sx={{
                    background: restaurant.isOpen ? '#4caf50' : '#f44336',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={restaurant.isActive ? 'Active' : 'Inactive'} 
                  onClick={() => onToggleActive && onToggleActive(restaurant)}
                  sx={{
                    background: restaurant.isActive ? '#4caf50' : '#9e9e9e',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    label={(restaurant.status || '').toString() || '—'}
                    sx={{
                      background: '#607d8b',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                    size="small"
                  />
                  {(restaurant.status === 'PENDING_APPROVAL') && (
                    <>
                      <Chip 
                        label={'Approve'}
                        onClick={() => onApprove && onApprove(restaurant)}
                        sx={{
                          background: '#2196f3',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        size="small"
                      />
                      <Chip 
                        label={'Reject'}
                        onClick={() => onReject && onReject(restaurant)}
                        sx={{
                          background: '#e91e63',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        size="small"
                      />
                    </>
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
