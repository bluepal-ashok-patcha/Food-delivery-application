import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Chip, 
  Button, 
  Divider,
  Paper,
  IconButton,
  Badge
} from '@mui/material';
import { 
  ArrowBack, 
  Star, 
  AccessTime, 
  LocalShipping, 
  ShoppingCart,
  Add,
  Remove,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { fetchRestaurantById } from '../../store/slices/restaurantSlice';
import { addToCart } from '../../store/slices/cartSlice';
// import { openCartModal } from '../../store/slices/uiSlice';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ReadMoreText Component for handling long descriptions with scrollable container
const ReadMoreText = ({ text, maxLength = 120, sx = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : text.substring(0, maxLength) + '...';
  
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ 
        maxHeight: isExpanded ? '80px' : '40px', // Fixed height for consistency
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        },
        ...sx
      }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontSize: '13px', 
            lineHeight: 1.4,
            color: '#666',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}
        >
          {displayText}
        </Typography>
      </Box>
      {shouldTruncate && (
        <Button
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            minWidth: 'auto',
            p: 0,
            fontSize: '11px',
            color: '#fc8019',
            textTransform: 'none',
            fontWeight: 600,
            mt: 0.5,
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
          endIcon={isExpanded ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </Box>
  );
};

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRestaurant, loading } = useSelector((state) => state.restaurants);
  const { items, totalItems } = useSelector((state) => state.cart);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(fetchRestaurantById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        customization: {}
      },
      restaurantId: currentRestaurant.id,
      restaurantName: currentRestaurant.name
    }));
    
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

  const handleRemoveFromCart = (item) => {
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
      {/* Compact Restaurant Header */}
      <Box sx={{ 
        backgroundColor: '#fc8019',
        color: 'white',
        py: 3
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ 
                color: 'white', 
                mr: 1.5,
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: '32px',
                height: '32px',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <ArrowBack sx={{ fontSize: '18px' }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '20px' }}>
              {currentRestaurant.name}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, fontSize: '14px', lineHeight: 1.4 }}>
            {currentRestaurant.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ fontSize: 16, color: '#ffc107' }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                {currentRestaurant.rating} ({currentRestaurant.totalRatings || 0} ratings)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                {currentRestaurant.deliveryTime}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalShipping sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                {formatPrice(currentRestaurant.deliveryFee)} delivery
              </Typography>
            </Box>
            <Chip 
              label={currentRestaurant.isOpen ? 'Open' : 'Closed'} 
              size="small"
              sx={{
                backgroundColor: currentRestaurant.isOpen ? '#4caf50' : '#f44336',
                color: 'white',
                fontWeight: 500,
                fontSize: '11px',
                height: '24px'
              }}
            />
          </Box>
          
          {/* Offers */}
          {currentRestaurant.offers && currentRestaurant.offers.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '13px' }}>
                Offers:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentRestaurant.offers.map((offer) => (
                  <Chip
                    key={offer.id}
                    label={offer.title}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '11px',
                      height: '24px',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {/* Menu Categories */}
        {currentRestaurant.menu?.map((category) => (
          <Box key={category.id} sx={{ mb: 4, width: '100%' }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#333',
                fontSize: '18px',
                borderBottom: '1px solid #fc8019',
                pb: 0.5,
                display: 'inline-block'
              }}
            >
              {category.category}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              width: '100%',
              maxWidth: '100%'
            }}>
              {category.items.map((item) => (
                <Paper 
                  key={item.id}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'stretch',
                    gap: 2,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    minHeight: '140px', // Fixed minimum height for consistency
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      borderColor: '#fc8019',
                    }
                  }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                      backgroundColor: '#f5f5f5'
                    }}>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback for broken images */}
                      <Box sx={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f0f0f0',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '10px',
                        fontWeight: 500
                      }}>
                        No Image
                      </Box>
                      {item.isPopular && (
                        <Box sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          backgroundColor: '#ff6b35',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          Popular
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ 
                      flexGrow: 1, 
                      minWidth: 0, 
                      maxWidth: '100%',
                      width: '100%',
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      boxSizing: 'border-box'
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: '#333',
                            fontSize: '16px',
                            lineHeight: 1.2,
                            flex: 1,
                            mr: 1,
                            minWidth: 0,
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <Typography variant="body2" sx={{ 
                                textDecoration: 'line-through', 
                                color: '#999',
                                fontSize: '12px',
                                fontWeight: 500
                              }}>
                                {formatPrice(item.originalPrice)}
                              </Typography>
                            )}
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600, 
                              color: '#fc8019',
                              fontSize: '16px'
                            }}>
                              {formatPrice(item.price)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <ReadMoreText 
                          text={item.description} 
                          maxLength={120}
                          sx={{ 
                            mb: 1,
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: 0
                          }}
                        />
                      </Box>
                      
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          {item.preparationTime && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              backgroundColor: '#f8f9fa',
                              px: 1,
                              py: 0.5,
                              borderRadius: '8px'
                            }}>
                              <AccessTime sx={{ fontSize: 12, color: '#666' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '11px' }}>
                                {item.preparationTime} min
                              </Typography>
                            </Box>
                          )}
                          {item.nutrition && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              backgroundColor: '#f8f9fa',
                              px: 1,
                              py: 0.5,
                              borderRadius: '8px'
                            }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '11px' }}>
                                {item.nutrition.calories} cal
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      flexShrink: 0, 
                      alignSelf: 'flex-start',
                      minWidth: 0,
                      maxWidth: '100%'
                    }}>
                      {getItemQuantity(item.id) > 0 && (
                        <IconButton 
                          onClick={() => handleRemoveFromCart(item)}
                          size="small"
                          sx={{ 
                            border: '1px solid #fc8019',
                            color: '#fc8019',
                            width: '28px',
                            height: '28px',
                            '&:hover': { 
                              backgroundColor: '#fff5f0'
                            }
                          }}
                        >
                          <Remove sx={{ fontSize: '16px' }} />
                        </IconButton>
                      )}
                      
                      {getItemQuantity(item.id) > 0 && (
                        <Typography variant="body1" sx={{ 
                          minWidth: 24, 
                          textAlign: 'center', 
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#333'
                        }}>
                          {getItemQuantity(item.id)}
                        </Typography>
                      )}
                      
                      <IconButton 
                        onClick={() => handleAddToCart(item)}
                        size="small"
                        sx={{ 
                          backgroundColor: '#fc8019',
                          color: 'white',
                          width: '28px',
                          height: '28px',
                          '&:hover': { 
                            backgroundColor: '#e6730a'
                          }
                        }}
                      >
                        <Add sx={{ fontSize: '16px' }} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
            </Box>
          </Box>
        ))}
      </Container>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          zIndex: 1000 
        }}>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/cart')}
            sx={{ 
              borderRadius: '20px',
              px: 3,
              py: 1.5,
              backgroundColor: '#fc8019',
              '&:hover': { 
                backgroundColor: '#e6730a',
                transform: 'translateY(-1px)'
              },
              boxShadow: '0 4px 12px rgba(252, 128, 25, 0.3)',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Badge 
              badgeContent={totalItems} 
              color="error" 
              sx={{ 
                mr: 1,
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff4444',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '10px'
                }
              }}
            >
              View Cart
            </Badge>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RestaurantPage;
