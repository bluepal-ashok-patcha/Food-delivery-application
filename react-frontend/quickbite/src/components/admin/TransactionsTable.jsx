import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography, Box } from '@mui/material';

const statusColor = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'SUCCESS': return 'success';
    case 'FAILED': return 'error';
    case 'PENDING': return 'warning';
    default: return 'default';
  }
};

const TransactionsTable = ({ transactions }) => {
  return (
    <TableContainer sx={{ borderRadius: '4px', border: '1px solid #e0e0e0', background: '#fff' }}>
      <Table>
        <TableHead sx={{ background: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Transaction</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Order</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Restaurant</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(transactions || []).map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.id}</TableCell>
              <TableCell>{tx.orderId || '—'}</TableCell>
              <TableCell>{tx.restaurantId || '—'}</TableCell>
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                  ₹{Number(tx.amount || 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={tx.status || '—'} color={statusColor(tx.status)} size="small" />
              </TableCell>
              <TableCell>
                {(tx.createdAt) ? new Date(tx.createdAt).toLocaleString() : '—'}
              </TableCell>
            </TableRow>
          ))}
          {(transactions || []).length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ textAlign: 'center', py: 3, color: '#777' }}>No transactions</Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionsTable;


