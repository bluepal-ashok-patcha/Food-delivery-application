import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Button } from '@mui/material';
import { ShoppingCart, Person, Menu, LocationOn, Search } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openAuthModal, openCartModal } from '../../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import Notification from '../common/Notification';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleCartClick = () => {
    dispatch(openCartModal());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: '#fff', 
          color: '#333', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #f0f0f0',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
            zIndex: -1
          }
        }}
      >
        <Toolbar sx={{ py: 2, position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 6 }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 800, 
                color: '#fc8019',
                fontSize: '28px',
                textShadow: '0 2px 4px rgba(252, 128, 25, 0.2)'
              }}
            >
              QuickBite
            </Typography>
          </Box>
          
          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 6 }}>
            <LocationOn sx={{ mr: 1.5, color: '#666', fontSize: 24 }} />
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 600, fontSize: '16px' }}>
              Deliver to: 123 Main St, City
            </Typography>
          </Box>
          
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 500, mr: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                borderColor: '#fc8019'
              },
              transition: 'all 0.3s ease'
            }}>
              <Search sx={{ mr: 1.5, color: '#666', fontSize: 24 }} />
              <Typography variant="body1" sx={{ color: '#999', fontSize: '16px' }}>
                Search for restaurants or food...
              </Typography>
            </Box>
          </Box>
          
          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleCartClick}
                  sx={{ 
                    backgroundColor: '#fc8019',
                    color: 'white',
                    width: '48px',
                    height: '48px',
                    boxShadow: '0 4px 12px rgba(252, 128, 25, 0.3)',
                    '&:hover': { 
                      backgroundColor: '#e6730a',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(252, 128, 25, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Badge 
                    badgeContent={totalItems} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff4444',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '12px'
                      }
                    }}
                  >
                    <ShoppingCart sx={{ fontSize: '24px' }} />
                  </Badge>
                </IconButton>
                
                <Button
                  variant="outlined"
                  startIcon={<Avatar sx={{ width: 24, height: 24 }} />}
                  sx={{ 
                    borderColor: '#e0e0e0',
                    color: '#333',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontSize: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: '#fc8019',
                      backgroundColor: '#fff5f0',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(252, 128, 25, 0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {user?.name}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<Person />}
                onClick={() => dispatch(openLoginModal())}
                sx={{ 
                  backgroundColor: '#fc8019',
                  '&:hover': { 
                    backgroundColor: '#e6730a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(252, 128, 25, 0.4)'
                  },
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(252, 128, 25, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      
      <Notification />
    </Box>
  );
};

export default Layout;
