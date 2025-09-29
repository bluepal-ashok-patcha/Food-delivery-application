import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip, Button } from '@mui/material';
import { Navigation, Phone, CheckCircle } from '@mui/icons-material';

const MyOrdersTable = ({ orders, onCompleteOrder }) => {
  return (
    <TableContainer sx={{ 
      borderRadius: '4px',
      border: '1px solid #e0e0e0',
      background: '#fff'
    }}>
      <Table>
        <TableHead sx={{ background: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Order</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Restaurant</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Earnings</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <TableCell>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                    #{order.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {order.items.length} items
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '14px', background: '#fc8019' }}>
                    C{order.customerId}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    Customer {order.customerId}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, background: '#fc8019' }}>
                    R{order.restaurantId}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    Restaurant {order.restaurantId}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={order.status.replace('_', ' ').toUpperCase()} 
                  sx={{
                    background: order.status === 'delivered' ? '#4caf50' : '#ff9800',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                  ${order.deliveryFee}
                </Typography>
              </TableCell>
              <TableCell>
                {order.status === 'out_for_delivery' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Navigation />}
                      sx={{
                        borderColor: '#2196f3',
                        color: '#2196f3',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '4px',
                        '&:hover': {
                          borderColor: '#1976d2',
                          backgroundColor: '#e3f2fd'
                        }
                      }}
                    >
                      Navigate
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Phone />}
                      sx={{
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '4px',
                        '&:hover': {
                          borderColor: '#388e3c',
                          backgroundColor: '#e8f5e8'
                        }
                      }}
                    >
                      Call
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => onCompleteOrder(order.id)}
                      sx={{
                        background: '#fc8019',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#e6730a'
                        }
                      }}
                    >
                      Complete
                    </Button>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MyOrdersTable;
