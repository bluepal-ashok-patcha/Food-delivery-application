import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip, Button } from '@mui/material';
import { Phone, DirectionsBike } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const DeliveryPartnersTable = ({ partners, onViewPartner, onEditPartner, onDeletePartner, onApprove, onReject }) => {
  return (
    <TableContainer sx={{ 
      borderRadius: '4px',
      border: '1px solid #e0e0e0',
      background: '#fff'
    }}>
      <Table>
        <TableHead sx={{ background: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Partner</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Vehicle Details</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(partners || []).map((partner) => (
            <TableRow 
              key={partner.id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40,
                    background: '#fc8019',
                    fontWeight: 700
                  }}>
                    {partner.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                      {partner.name}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {partner.phoneNumber || '—'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsBike sx={{ fontSize: 18, color: '#666' }} />
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {partner.vehicleDetails || '—'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={(partner.status || 'OFFLINE').toString()} 
                  sx={{
                    background: (partner.status || 'OFFLINE').toString() === 'AVAILABLE' ? '#4caf50' : 
                               (partner.status || 'OFFLINE').toString() === 'ON_DELIVERY' ? '#2196f3' : 
                               (partner.status || 'OFFLINE').toString() === 'OFFLINE' ? '#ff9800' : '#666',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {partner.isPending ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => onApprove && onApprove(partner)}
                      sx={{ 
                        fontSize: '12px',
                        px: 2,
                        py: 0.5,
                        textTransform: 'none'
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onReject && onReject(partner)}
                      sx={{ 
                        fontSize: '12px',
                        px: 2,
                        py: 0.5,
                        textTransform: 'none'
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                ) : (
                  <ActionButtons 
                    menuOnly
                    onView={() => onViewPartner && onViewPartner(partner)}
                    onEdit={() => onEditPartner && onEditPartner(partner)}
                    onDelete={() => onDeletePartner && onDeletePartner(partner)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryPartnersTable;
