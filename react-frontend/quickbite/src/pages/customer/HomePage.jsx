import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Chip, 
  TextField, 
  InputAdornment,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Avatar,
  Badge,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  Star, 
  FilterList,
  Sort,
  FavoriteBorder,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchRestaurants } from '../../store/slices/restaurantSlice';
import { openLocationModal } from '../../store/slices/uiSlice';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { mockCategories } from '../../constants/mockData';

// ReadMoreText Component for handling long descriptions with scrollable container
const ReadMoreText = ({ text, maxLength = 100, sx = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : text.substring(0, maxLength) + '...';
  
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ 
        maxHeight: isExpanded ? '60px' : '32px', // Fixed height for consistency
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
            fontSize: '12px', 
            lineHeight: 1.4,
            color: '#888',
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

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filtered: restaurants, status: restaurantStatus } = useSelector((state) => state.restaurants);
  const { currentLocation } = useSelector((state) => state.location);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const handleLocationClick = () => {
    dispatch(openLocationModal());
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      dispatch(fetchRestaurants({ search: searchQuery, cuisine: activeCategory }));
    }
  };

  const handleCategoryClick = (category) => {
    const newCategory = activeCategory === category ? null : category;
    setActiveCategory(newCategory);
    dispatch(fetchRestaurants({ search: searchQuery, cuisine: newCategory }));
  };

  const handleRestaurantClick = (id) => {
    navigate(`/restaurant/${id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  if (restaurantStatus === 'loading') {
    return <LoadingSpinner fullScreen message="Loading restaurants..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Compact Swiggy-like Header */}
      <Box sx={{ 
        backgroundColor: '#fc8019',
        color: 'white',
        py: 3,
        mb: 3
      }}>
        <Container maxWidth="lg">
          {/* Location Bar */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }}
            onClick={handleLocationClick}
          >
            <LocationOn sx={{ mr: 1, fontSize: 20, color: 'white' }} />
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px', color: 'white' }}>
              Deliver to: {currentLocation.address}
            </Typography>
          </Box>
          
          {/* Search Bar */}
          <Box sx={{ maxWidth: 600 }}>
            <TextField
              fullWidth
              placeholder="Search for restaurants or food..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchSubmit}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#666', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '40px',
                  fontSize: '14px',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                  },
                }
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Compact Categories */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#333', 
            mb: 2,
            fontSize: '18px'
          }}>
            Popular Categories
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {mockCategories.map((category) => (
              <Chip
                key={category.id}
                label={`${category.icon} ${category.name}`}
                onClick={() => handleCategoryClick(category.name)}
                variant={activeCategory === category.name ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: activeCategory === category.name ? '#fc8019' : 'white',
                  color: activeCategory === category.name ? 'white' : '#333',
                  borderColor: '#e0e0e0',
                  fontWeight: 500,
                  fontSize: '13px',
                  height: '32px',
                  borderRadius: '16px',
                  px: 2,
                  '&:hover': {
                    backgroundColor: activeCategory === category.name ? '#e6730a' : '#f8f9fa',
                  },
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '18px', fontWeight: 600 }}>
              No restaurants found
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            width: '100%',
            justifyContent: { xs: 'center', sm: 'flex-start', md: 'flex-start' }
          }}>
            {restaurants.map((restaurant) => (
              <Box
                key={restaurant.id}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' },
                  maxWidth: { xs: '400px', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' },
                  minWidth: { xs: '300px', sm: '280px', md: '280px' },
                  flex: '0 0 auto'
                }}
              >
                <Card
                  sx={{
                    cursor: 'pointer', 
                    height: '380px', // Fixed height for consistency
                    width: '100%', 
                    minWidth: 0,
                    maxWidth: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                    flex: '1 1 auto',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)',
                    }
                  }}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                >
                  {/* Image Container with Fixed Dimensions */}
                  <Box sx={{ 
                    position: 'relative',
                    height: '160px',
                    width: '100%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#f5f5f5'
                  }}>
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
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
                      fontSize: '14px',
                      fontWeight: 500
                    }}>
                      No Image
                    </Box>
                    
                    {/* Offers Badge */}
                    {restaurant.offers && restaurant.offers.length > 0 && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8,
                        backgroundColor: '#ff6b35',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        maxWidth: '80%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {restaurant.offers[0].title}
                      </Box>
                    )}
                    
                    {/* Favorite Button */}
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        width: '28px',
                        height: '28px',
                        '&:hover': { 
                          backgroundColor: 'white',
                        }
                      }}
                    >
                      <FavoriteBorder sx={{ fontSize: '16px', color: '#666' }} />
                    </IconButton>
                  </Box>
                  
                  {/* Card Content */}
                  <CardContent sx={{ 
                    p: 2.5, 
                    flex: 1,
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    height: '200px', // Fixed height for content area
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                  }}>
                    {/* Restaurant Name and Rating */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#333', 
                            fontSize: '16px',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            mr: 1,
                            minWidth: 0,
                            maxWidth: '100%'
                          }}
                        >
                          {restaurant.name}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5, 
                          flexShrink: 0,
                          backgroundColor: '#f8f9fa',
                          px: 1,
                          py: 0.5,
                          borderRadius: '6px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <Star sx={{ fontSize: 14, color: '#ffc107' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>
                            {restaurant.rating}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '13px', color: '#666', fontWeight: 500 }}>
                        {restaurant.cuisine} • {restaurant.deliveryTime}
                      </Typography>
                      
                      <ReadMoreText 
                        text={restaurant.description} 
                        maxLength={80}
                        sx={{ 
                          flex: 1,
                          width: '100%',
                          maxWidth: '100%',
                          minWidth: 0
                        }}
                      />
                    </Box>
                    
                    {/* Bottom Section */}
                    <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #f0f0f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
                          {formatPrice(restaurant.deliveryFee)} delivery
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
                          Min. {formatPrice(restaurant.minimumOrder)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
