import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip } from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const OrdersTable = ({ orders, getStatusColor, onViewOrder, onUpdateStatus, onAssignPartner }) => {
  return (
    <TableContainer sx={{ 
      borderRadius: '3px',
      border: '1px solid #e0e0e0',
      background: '#fff'
    }}>
      <Table>
        <TableHead sx={{ background: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Order</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Items</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Restaurant</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Placed At</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(orders || []).map((order) => (
            <TableRow 
              key={order.id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                  {order.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  {order.itemCount || order.items?.length || 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  {order.customerName || order.userId || order.customerId || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, background: '#fc8019' }}>
                    <Restaurant sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {order.restaurantName || order.restaurantId || '—'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                  ₹{Number((order.totalAmount != null ? order.totalAmount : order.total) || 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                {(() => {
                  const status = (order.orderStatus || order.status || '').toString();
                  const normalized = status ? status.replace('_', ' ').toUpperCase() : '—';
                  const colorKey = getStatusColor ? getStatusColor(order.orderStatus || order.status) : 'default';
                  const bg = colorKey === 'success' ? '#4caf50' : colorKey === 'warning' ? '#ff9800' : colorKey === 'error' ? '#f44336' : '#9e9e9e';
                  return (
                    <Chip 
                      label={normalized}
                      variant="outlined"
                      sx={{
                        background: bg,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '12px'
                      }}
                      size="small"
                    />
                  );
                })()}
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {(order.createdAt || order.orderDate) ? new Date(order.createdAt || order.orderDate).toLocaleString() : '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <ActionButtons 
                  showDelete={false} 
                  menuOnly
                  onView={() => onViewOrder && onViewOrder(order)}
                  onEdit={() => onUpdateStatus && onUpdateStatus(order)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdersTable;
