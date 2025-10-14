import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Button } from '@mui/material';
import { ShoppingCart, Person, Menu, LocationOn, Search, Restaurant, DeliveryDining } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { openLoginModal, toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { openLocationModal } from '../../store/slices/locationSlice';
import { useNavigate } from 'react-router-dom';
import Notification from '../common/Notification';
import LocationModal from '../modals/LocationModal';
import AccurateMapSelector from '../maps/AccurateMapSelector';
import RestaurantPartnerModal from '../modals/RestaurantPartnerModal';
import DeliveryPartnerModal from '../modals/DeliveryPartnerModal';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, userRole } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { isSidebarOpen } = useSelector((state) => state.ui);
  const { currentLocation } = useSelector((state) => state.location);
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleRestaurantPartnerClick = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    // Check if user is already a restaurant owner
    if (userRole === 'restaurant_owner') {
      navigate('/restaurant-owner');
      return;
    }
    setRestaurantModalOpen(true);
  };

  const handleDeliveryPartnerClick = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    // Check if user is already a delivery partner
    if (userRole === 'delivery_partner') {
      navigate('/delivery');
      return;
    }
    setDeliveryModalOpen(true);
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
        <Toolbar sx={{ py: 1, position: 'relative', zIndex: 2, minHeight: '60px !important', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
              mr: 3,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              },
              transition: 'opacity 0.2s ease',
              flex: '0 0 auto',
              maxWidth: { xs: '200px', sm: '250px', md: '300px' }
            }}
            onClick={() => dispatch(openLocationModal())}
          >
            <LocationOn sx={{ mr: 1, color: '#666', fontSize: 18, flexShrink: 0 }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#333', 
                fontWeight: 600, 
                fontSize: '14px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                minWidth: 0
              }}
            >
              {currentLocation?.address ? 
                (currentLocation.address.length > 30 ? 
                  `${currentLocation.address.substring(0, 30)}...` : 
                  currentLocation.address
                ) : 
                'Select Location'
              }
            </Typography>
          </Box>
          
          {/* Spacer to push buttons to the right */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexShrink: 0 }}>
            {/* Partner Buttons - Always Visible */}
            <Button
              variant="outlined"
              startIcon={<Restaurant />}
              onClick={handleRestaurantPartnerClick}
              sx={{ 
                borderColor: '#fc8019',
                color: '#fc8019',
                '&:hover': { 
                  borderColor: '#e6730a',
                  backgroundColor: '#fff5f0',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(252, 128, 25, 0.15)'
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '3px',
                px: 1.5,
                py: 0.5,
                fontSize: '12px',
                minWidth: 'auto',
                transition: 'all 0.3s ease'
              }}
            >
              Restaurant
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeliveryDining />}
              onClick={handleDeliveryPartnerClick}
              sx={{ 
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': { 
                  borderColor: '#388e3c',
                  backgroundColor: '#e8f5e8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '3px',
                px: 1.5,
                py: 0.5,
                fontSize: '12px',
                minWidth: 'auto',
                transition: 'all 0.3s ease'
              }}
            >
              Delivery
            </Button>

            {/* Authentication-based buttons */}
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
                    sx={{ fontWeight: 600, fontSize: '12px', px: 1.5, py: 0.5, minWidth: 'auto' }}
                  >
                    Admin
                  </Button>
                )}
                {userRole === 'restaurant_owner' && (
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/restaurant-owner')} 
                    sx={{ fontWeight: 600, fontSize: '12px', px: 1.5, py: 0.5, minWidth: 'auto' }}
                  >
                    Dashboard
                  </Button>
                )}
                {userRole === 'delivery_partner' && (
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/delivery')} 
                    sx={{ fontWeight: 600, fontSize: '12px', px: 1.5, py: 0.5, minWidth: 'auto' }}
                  >
                    Dashboard
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Avatar sx={{ width: 16, height: 16 }} />}
                  onClick={() => {
                    if (userRole === 'customer') {
                      navigate('/profile');
                    } else {
                      // Do nothing for admin, restaurant_owner, delivery_partner
                    }
                  }}
                  sx={{ 
                    borderColor: '#e0e0e0',
                    color: '#333',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '3px',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '12px',
                    minWidth: 'auto',
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
                  {user?.name?.length > 8 ? `${user.name.substring(0, 8)}...` : user?.name}
                </Button>
                <Button 
                  onClick={() => dispatch(logout())} 
                  sx={{ fontWeight: 700, fontSize: '12px', px: 1.5, py: 0.5, minWidth: 'auto' }}
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
                  px: 2,
                  py: 0.5,
                  fontSize: '12px',
                  minWidth: 'auto',
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
      <AccurateMapSelector />
      <RestaurantPartnerModal 
        open={restaurantModalOpen} 
        onClose={() => setRestaurantModalOpen(false)} 
      />
      <DeliveryPartnerModal 
        open={deliveryModalOpen} 
        onClose={() => setDeliveryModalOpen(false)} 
      />
    </Box>
  );
};

export default Layout;
