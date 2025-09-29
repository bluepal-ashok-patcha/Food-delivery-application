import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip } from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const OrdersTable = ({ orders, getStatusColor }) => {
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
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Date</TableCell>
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
                    <Restaurant sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    Restaurant {order.restaurantId}
                  </Typography>
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
                    background: getStatusColor(order.status) === 'success' ? '#4caf50' :
                      getStatusColor(order.status) === 'warning' ? '#ff9800' : '#f44336',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {new Date(order.orderDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <ActionButtons showDelete={false} showMore={false} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdersTable;
