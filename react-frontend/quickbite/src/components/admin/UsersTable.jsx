import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Avatar, Typography, Chip } from '@mui/material';
import { Email, Phone } from '@mui/icons-material';
import ActionButtons from './ActionButtons';

const UsersTable = ({ users, onViewUser, onEditUser, onDeleteUser, onToggleActive }) => {
  return (
    <TableContainer sx={{ 
      borderRadius: '4px',
      border: '1px solid #e0e0e0',
      background: '#fff'
    }}>
      <Table>
        <TableHead sx={{ background: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>User</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
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
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                      {user.name}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Email sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {user.phone}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.role.replace('_', ' ').toUpperCase()} 
                  variant="outlined"
                  sx={{
                    background: user.role === 'admin' ? '#f44336' : '#2196f3',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '12px'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  variant="outlined"
                  onClick={() => onToggleActive && onToggleActive(user)}
                  sx={{
                    background: user.isActive ? '#4caf50' : '#9e9e9e',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <ActionButtons 
                  menuOnly
                  onView={() => onViewUser && onViewUser(user)}
                  onEdit={() => onEditUser && onEditUser(user)}
                  onDelete={() => onDeleteUser && onDeleteUser(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;
