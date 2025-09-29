import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip } from '@mui/material';
import { Restaurant, LocationOn, Star } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const RestaurantsTable = ({ restaurants }) => {
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
                  label={restaurant.cuisine} 
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
                  sx={{
                    background: restaurant.isOpen ? '#4caf50' : '#f44336',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <ActionButtons />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RestaurantsTable;
