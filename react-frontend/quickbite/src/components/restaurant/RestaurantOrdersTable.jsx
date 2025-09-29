import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip, Button } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const RestaurantOrdersTable = ({ orders, onOrderAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return '#2196f3';
      case 'preparing': return '#ff9800';
      case 'ready_for_pickup': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

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
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Items</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Time</TableCell>
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
                <Box>
                  {order.items.slice(0, 2).map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                      {item.quantity}x {item.name}
                    </Typography>
                  ))}
                  {order.items.length > 2 && (
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px' }}>
                      +{order.items.length - 2} more
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                  ${order.total.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={order.status.replace('_', ' ').toUpperCase()} 
                  sx={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {new Date(order.orderDate).toLocaleTimeString()}
                </Typography>
              </TableCell>
              <TableCell>
                {order.status === 'placed' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => onOrderAction(order.id, 'accept')}
                      sx={{
                        background: '#4caf50',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#388e3c'
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => onOrderAction(order.id, 'reject')}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '4px',
                        '&:hover': {
                          borderColor: '#d32f2f',
                          backgroundColor: '#ffebee'
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
                {order.status === 'preparing' && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onOrderAction(order.id, 'ready')}
                    sx={{
                      background: '#fc8019',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '6px',
                      '&:hover': {
                        background: '#e6730a'
                      }
                    }}
                  >
                    Mark Ready
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RestaurantOrdersTable;
