import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip, Button } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const RestaurantOrdersTable = ({ orders, onOrderAction, onRowClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#6c757d';
      case 'ACCEPTED': return '#28a745';
      case 'PREPARING': return '#fd7e14';
      case 'READY_FOR_PICKUP': return '#6f42c1';
      case 'OUT_FOR_DELIVERY': return '#20c997';
      case 'DELIVERED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

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
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Items</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Payment</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Time</TableCell>
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
              onClick={onRowClick ? () => onRowClick(order) : undefined}
            >
              <TableCell>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                    Order {order.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {order.itemCount || order.items?.length || 0} items
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '14px', background: '#6c757d' }}>
                    {order.customerName ? order.customerName.charAt(0).toUpperCase() : `C${order.userId}`}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {order.customerName || `Customer ${order.userId}`}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  {(order.items || []).slice(0, 2).map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                      {item.quantity}x {item.name}
                    </Typography>
                  ))}
                  {(order.items || []).length > 2 && (
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '12px' }}>
                      +{(order.items || []).length - 2} more
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                  ${(order.totalAmount || 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={(order.paymentStatus || 'PENDING').replace('_', ' ').toUpperCase()} 
                  variant="outlined"
                  sx={{
                    borderColor: order.paymentStatus === 'PAID' || order.paymentStatus === 'COMPLETED' ? '#28a745' : 
                               order.paymentStatus === 'FAILED' ? '#dc3545' : '#6c757d',
                    color: order.paymentStatus === 'PAID' || order.paymentStatus === 'COMPLETED' ? '#28a745' : 
                           order.paymentStatus === 'FAILED' ? '#dc3545' : '#6c757d',
                    fontWeight: 500,
                    fontSize: '11px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={(order.orderStatus || 'UNKNOWN').replace('_', ' ').toUpperCase()} 
                  variant="outlined"
                  sx={{
                    borderColor: getStatusColor(order.orderStatus),
                    color: getStatusColor(order.orderStatus),
                    fontWeight: 500,
                    fontSize: '11px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                {/* Only show action buttons for paid orders */}
                {order.paymentStatus === 'PAID' || order.paymentStatus === 'COMPLETED' ? (
                  <>
                    {order.orderStatus === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={(e) => { e.stopPropagation(); onOrderAction(order.id, 'accept'); }}
                          sx={{
                            background: '#28a745',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: '3px',
                            fontSize: '12px',
                            '&:hover': {
                              background: '#218838'
                            }
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={(e) => { e.stopPropagation(); onOrderAction(order.id, 'reject'); }}
                          sx={{
                            borderColor: '#dc3545',
                            color: '#dc3545',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: '3px',
                            fontSize: '12px',
                            '&:hover': {
                              borderColor: '#c82333',
                              backgroundColor: '#f8d7da'
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {order.orderStatus === 'ACCEPTED' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => { e.stopPropagation(); onOrderAction(order.id, 'preparing'); }}
                        sx={{
                          background: '#fd7e14',
                          textTransform: 'none',
                          fontWeight: 500,
                          borderRadius: '3px',
                          fontSize: '12px',
                          '&:hover': {
                            background: '#e8690b'
                          }
                        }}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.orderStatus === 'PREPARING' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => { e.stopPropagation(); onOrderAction(order.id, 'ready'); }}
                        sx={{
                          background: '#6f42c1',
                          textTransform: 'none',
                          fontWeight: 500,
                          borderRadius: '3px',
                          fontSize: '12px',
                          '&:hover': {
                            background: '#5a32a3'
                          }
                        }}
                      >
                        Mark Ready
                      </Button>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    Awaiting Payment
                  </Typography>
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
