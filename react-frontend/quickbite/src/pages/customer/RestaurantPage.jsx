import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Grid, Chip, Divider, Paper, Avatar, Rating, Button, IconButton, Modal, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { ArrowBack, Star, AccessTime, LocalShipping, Phone, LocationOn, FavoriteBorder, Share, Menu } from '@mui/icons-material';
import { fetchRestaurantById } from '../../store/slices/restaurantSlice';
import { addToCartAsync, updateCartItemAsync, removeCartItemAsync, fetchCartPricing } from '../../store/slices/cartSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MenuItemRow from '../../components/restaurant/MenuItemRow';
import FloatingCartButton from '../../components/common/FloatingCartButton';
import RestaurantReviews from '../../components/restaurant/RestaurantReviews';
import { fetchRestaurantReviews } from '../../store/slices/reviewsSlice';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRestaurant, loading } = useSelector((state) => state.restaurants);
  const { items, totalItems } = useSelector((state) => state.cart);
  const [quantities, setQuantities] = useState({});
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchRestaurantById(id));
      dispatch(fetchRestaurantReviews(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = async (item) => {
    await dispatch(addToCartAsync({
      restaurantId: currentRestaurant.id,
      menuItemId: item.id,
      quantity: 1,
      customization: {}
    }));
    await dispatch(fetchCartPricing());
    setQuantities(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveFromCart = async (item) => {
    const nextQty = Math.max(0, (quantities[item.id] || 1) - 1);
    await dispatch(updateCartItemAsync({ menuItemId: item.id, quantity: nextQty, customization: {} }));
    await dispatch(fetchCartPricing());
    setQuantities(prev => ({
      ...prev,
      [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
    }));
  };

  const getItemQuantity = (itemId) => {
    return quantities[itemId] || 0;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading restaurant..." />;
  }

  if (!currentRestaurant) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Restaurant not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Swiggy-like Restaurant Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${currentRestaurant.coverImage || currentRestaurant.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 1
        }} />
        
        {/* Header Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 1 }}>
          {/* Back Button */}
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'white', 
              mb: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <ArrowBack />
          </IconButton>

          <Grid container spacing={2} alignItems="center">
            {/* Restaurant Image */}
            <Grid item xs={12} sm={3} md={2}>
              <Box sx={{ 
                width: { xs: '60px', sm: '80px' }, 
                height: { xs: '60px', sm: '80px' },
                borderRadius: '3px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                mx: 'auto',
                display: 'block'
              }}>
                <img 
                  src={currentRestaurant.image} 
                  alt={currentRestaurant.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              </Box>
            </Grid>

            {/* Restaurant Info */}
            <Grid item xs={12} sm={9} md={10}>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 800, 
                  mb: 0.5,
                  fontSize: { xs: '18px', sm: '20px', md: '22px' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {currentRestaurant.name}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  mb: 1, 
                  opacity: 0.9,
                  fontSize: { xs: '12px', sm: '14px' },
                  fontWeight: 500
                }}>
                  {currentRestaurant.description}
                </Typography>

                {/* Rating and Info */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={currentRestaurant.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentRestaurant.rating} ({currentRestaurant.totalRatings}+)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {currentRestaurant.deliveryTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(currentRestaurant.deliveryFee)} delivery
                    </Typography>
                  </Box>
                </Box>

                {/* Restaurant Details */}
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '11px' }}>
                        {currentRestaurant.address}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '11px' }}>
                        {currentRestaurant.phone}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Tags and Status */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {currentRestaurant.tags?.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                  ))}
                  <Chip 
                    label={currentRestaurant.isOpen ? 'Open Now' : 'Closed'}
                    size="small"
                    sx={{ 
                      backgroundColor: currentRestaurant.isOpen ? '#4caf50' : '#f44336',
                      color: 'white',
                      fontWeight: 700
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}>
                    <FavoriteBorder sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}>
                    <Share sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Menu Categories Navigation */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            py: 2,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
          }}>
            {currentRestaurant.menu?.map((category, index) => (
              <Button
                key={category.id}
                onClick={() => {
                  const element = document.getElementById(`category-${category.id}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  borderRadius: '3px',
                  backgroundColor: index === 0 ? '#fc8019' : 'transparent',
                  color: index === 0 ? 'white' : '#666',
                  border: '1px solid #e0e0e0',
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: index === 0 ? '#e6730a' : '#f8f9fa',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {category.category}
                <Chip 
                  label={category.items?.length || 0}
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: index === 0 ? 'rgba(255,255,255,0.2)' : '#fc8019',
                    color: index === 0 ? 'white' : 'white',
                    fontWeight: 700,
                    fontSize: '11px',
                    height: 20,
                    minWidth: 20
                  }}
                />
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Menu Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <RestaurantReviews restaurantId={currentRestaurant.id} />
        </Box>
        {currentRestaurant.menu?.map((category) => (
          <Box key={category.id} id={`category-${category.id}`} sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 3, 
                color: '#1a1a1a',
                fontSize: '22px',
                borderBottom: '2px solid #fc8019',
                pb: 1,
                display: 'inline-block'
              }}
            >
              {category.category}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2
            }}>
              {category.items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={() => handleAddToCart(item)}
                  onRemove={() => handleRemoveFromCart(item)}
                  formatPrice={formatPrice}
                />
                ))}
            </Box>
          </Box>
        ))}
      </Container>
      
      {/* Floating Menu Button */}
      <Box sx={{
        position: 'fixed',
        bottom: 100,
        right: 20,
        zIndex: 1000
      }}>
        <Button
          onClick={() => setMenuModalOpen(true)}
          sx={{
            backgroundColor: '#fc8019',
            color: 'white',
            borderRadius: '3px',
            px: 2,
            py: 1,
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(252, 128, 25, 0.3)',
            '&:hover': {
              backgroundColor: '#e6730a',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(252, 128, 25, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
          startIcon={<Menu />}
        >
          Menu
        </Button>
      </Box>

      {/* Menu Modal */}
      <Modal
        open={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper sx={{
          width: { xs: '90%', sm: '400px' },
          maxHeight: '70vh',
          borderRadius: '3px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <Box sx={{
            p: 2,
            backgroundColor: '#fc8019',
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Menu Categories
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Choose a category to jump to
            </Typography>
          </Box>
          
          <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
            {currentRestaurant.menu?.map((category, index) => (
              <ListItem key={category.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    const element = document.getElementById(`category-${category.id}`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setMenuModalOpen(false);
                  }}
                  sx={{
                    py: 2,
                    px: 3,
                    borderBottom: '1px solid #f0f0f0',
                    '&:hover': {
                      backgroundColor: '#fff5f0'
                    }
                  }}
                >
                  <ListItemText
                    primary={category.category}
                    secondary={`${category.items?.length || 0} items`}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '16px'
                    }}
                    secondaryTypographyProps={{
                      fontSize: '14px',
                      color: '#666'
                    }}
                  />
                  <Chip
                    label={category.items?.length || 0}
                    size="small"
                    sx={{
                      backgroundColor: '#fc8019',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '11px',
                      height: 20,
                      minWidth: 20
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Modal>
      
      <FloatingCartButton totalItems={totalItems} onClick={() => navigate('/cart')} />
    </Box>
  );
};

export default RestaurantPage;
