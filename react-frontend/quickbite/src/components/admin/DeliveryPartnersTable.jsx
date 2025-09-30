import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip } from '@mui/material';
import { Phone, Email, Star, DirectionsBike, DirectionsCar, DirectionsWalk } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const DeliveryPartnersTable = ({ partners, onViewPartner, onEditPartner, onDeletePartner }) => {
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
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Vehicle</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Rating</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {partners.map((partner) => (
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
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Phone sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {partner.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {partner.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {partner.vehicleType === 'Bike' ? <DirectionsBike sx={{ fontSize: 18, color: '#666' }} /> :
                   partner.vehicleType === 'Car' ? <DirectionsCar sx={{ fontSize: 18, color: '#666' }} /> :
                   <DirectionsWalk sx={{ fontSize: 18, color: '#666' }} />}
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {partner.vehicleType}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 18, color: '#ffc107' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                    {partner.rating}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={partner.isOnline ? 'Online' : 'Offline'} 
                  sx={{
                    background: partner.isOnline ? '#4caf50' : '#666',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <ActionButtons 
                  menuOnly
                  onView={() => onViewPartner && onViewPartner(partner)}
                  onEdit={() => onEditPartner && onEditPartner(partner)}
                  onDelete={() => onDeletePartner && onDeletePartner(partner)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeliveryPartnersTable;
