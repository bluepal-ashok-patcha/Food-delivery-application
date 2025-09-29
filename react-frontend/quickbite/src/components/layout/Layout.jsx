import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Button } from '@mui/material';
import { ShoppingCart, Person, Menu, LocationOn, Search } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openLoginModal, toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { openLocationModal } from '../../store/slices/locationSlice';
import { useNavigate } from 'react-router-dom';
import Notification from '../common/Notification';
import LocationModal from '../modals/LocationModal';
import MapSelector from '../maps/MapSelector';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, userRole } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { isSidebarOpen } = useSelector((state) => state.ui);
  const { currentLocation } = useSelector((state) => state.location);

  const handleCartClick = () => {
    navigate('/cart');
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
        <Toolbar sx={{ py: 1, position: 'relative', zIndex: 2, minHeight: '60px !important' }}>
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 4,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              },
              transition: 'opacity 0.2s ease'
            }}
            onClick={() => navigate('/')}
          >
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 800, 
                color: '#fc8019',
                fontSize: '22px',
                textShadow: '0 2px 4px rgba(252, 128, 25, 0.2)'
              }}
            >
              QuickBite
            </Typography>
          </Box>
          
          {/* Location */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 4,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              },
              transition: 'opacity 0.2s ease'
            }}
            onClick={() => dispatch(openLocationModal())}
          >
            <LocationOn sx={{ mr: 1, color: '#666', fontSize: 18 }} />
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 600, fontSize: '14px' }}>
              Deliver to: {currentLocation?.address || '123 Main St, City'}
            </Typography>
          </Box>
          
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 400, mr: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '3px',
              px: 2,
              py: 1,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                borderColor: '#fc8019'
              },
              transition: 'all 0.3s ease'
            }}>
              <Search sx={{ mr: 1, color: '#666', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#999', fontSize: '14px' }}>
                Search for restaurants or food...
              </Typography>
            </Box>
          </Box>
          
          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
            {isAuthenticated ? (
              <>
                {userRole === 'customer' && (
                <IconButton
                  color="inherit"
                  onClick={handleCartClick}
                  sx={{ 
                    backgroundColor: '#fc8019',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    boxShadow: '0 2px 8px rgba(252, 128, 25, 0.3)',
                    '&:hover': { 
                      backgroundColor: '#e6730a',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(252, 128, 25, 0.4)'
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
                        fontSize: '10px'
                      }
                    }}
                  >
                    <ShoppingCart sx={{ fontSize: '20px' }} />
                  </Badge>
                </IconButton>
                )}
                {userRole === 'admin' && (
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/admin')} 
                    sx={{ fontWeight: 600, fontSize: '14px', px: 2, py: 0.5 }}
                  >
                    Admin
                  </Button>
                )}
                {userRole === 'restaurant_owner' && (
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/restaurant-owner')} 
                    sx={{ fontWeight: 600, fontSize: '14px', px: 2, py: 0.5 }}
                  >
                    Restaurant
                  </Button>
                )}
                {userRole === 'delivery_partner' && (
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/delivery')} 
                    sx={{ fontWeight: 600, fontSize: '14px', px: 2, py: 0.5 }}
                  >
                    Delivery
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Avatar sx={{ width: 20, height: 20 }} />}
                  sx={{ 
                    borderColor: '#e0e0e0',
                    color: '#333',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '3px',
                    px: 2,
                    py: 0.5,
                    fontSize: '14px',
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
                <Button 
                  onClick={() => dispatch(logout())} 
                  sx={{ fontWeight: 700, fontSize: '14px', px: 2, py: 0.5 }}
                >
                  Logout
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
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(252, 128, 25, 0.4)'
                  },
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '3px',
                  px: 3,
                  py: 0.5,
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(252, 128, 25, 0.3)',
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
      <LocationModal />
      <MapSelector />
    </Box>
  );
};

export default Layout;
