import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Avatar, Badge, Tooltip } from '@mui/material';
import { Edit, Star, AccessTime, LocalFireDepartment } from '@mui/icons-material';

const MenuCard = ({ item }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card sx={{ 
      height: '400px', // Fixed height for all cards
      width: '100%', // Full width of container
      minWidth: '280px', // Minimum width
      maxWidth: '320px', // Maximum width
      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flex: '0 0 auto', // Don't grow or shrink
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(252, 128, 25, 0.15)',
        borderColor: '#fc8019',
        '& .menu-image': {
          transform: 'scale(1.1)'
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #fc8019 0%, #ff6b35 100%)',
        opacity: item.isPopular ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }
    }}>
      {/* Image Section */}
      <Box sx={{ 
        position: 'relative', 
        height: '180px', 
        overflow: 'hidden',
        borderRadius: '16px 16px 0 0',
        backgroundColor: '#f5f5f5'
      }}>
        <img 
          src={item.image} 
          alt={item.name}
          className="menu-image"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
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
        
        {/* Popular Badge */}
        {item.isPopular && (
          <Box sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'linear-gradient(135deg, #ff6b35 0%, #fc8019 100%)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
          }}>
            <LocalFireDepartment sx={{ fontSize: 14 }} />
            Popular
          </Box>
        )}

        {/* Veg/Non-Veg Badge */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography sx={{ 
            fontSize: 18, 
            color: item.isVeg ? '#4caf50' : '#f44336',
            fontWeight: 'bold'
          }}>
            {item.isVeg ? '🟢' : '🔴'}
          </Typography>
        </Box>

        {/* Edit Button */}
        <Tooltip title="Edit Item">
          <IconButton 
            size="small"
            sx={{ 
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#fc8019',
              width: 36,
              height: 36,
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                backgroundColor: '#fc8019',
                color: 'white',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Edit sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ 
        p: 3, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0 // Allow content to shrink
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#1a1a1a',
            fontSize: '18px',
            lineHeight: 1.3,
            flex: 1,
            mr: 1,
            minHeight: '24px', // Fixed height for title
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {item.name}
          </Typography>
        </Box>

        {/* Description - Fixed height */}
        <Typography variant="body2" sx={{ 
          color: '#666', 
          mb: 2, 
          fontSize: '14px',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '42px', // Fixed height for 2 lines (14px * 1.5 * 2)
          maxHeight: '42px'
        }}>
          {item.description}
        </Typography>

        {/* Price and Info - Fixed height */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          minHeight: '32px' // Fixed height for price section
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ 
              color: '#fc8019', 
              fontWeight: 700, 
              fontSize: '18px'
            }}>
              {formatPrice(item.price)}
            </Typography>
            {item.originalPrice && item.originalPrice > item.price && (
              <Typography variant="body2" sx={{ 
                textDecoration: 'line-through', 
                color: '#999', 
                fontSize: '14px',
                fontWeight: 500
              }}>
                {formatPrice(item.originalPrice)}
              </Typography>
            )}
          </Box>
          
          {item.preparationTime && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              backgroundColor: '#f8f9fa',
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              minWidth: 'fit-content'
            }}>
              <AccessTime sx={{ fontSize: 14, color: '#666' }} />
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                fontSize: '12px',
                color: '#666'
              }}>
                {item.preparationTime}m
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status and Nutrition - Fixed height */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto', // Push to bottom
          minHeight: '32px' // Fixed height for bottom section
        }}>
          <Chip 
            label={item.isAvailable ? 'Available' : 'Out of Stock'} 
            sx={{
              background: item.isAvailable 
                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' 
                : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '11px',
              height: 28,
              borderRadius: '14px',
              boxShadow: item.isAvailable 
                ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                : '0 2px 8px rgba(244, 67, 54, 0.3)'
            }}
            size="small"
          />
          
          {item.nutrition && (
            <Typography variant="body2" sx={{ 
              color: '#999',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {item.nutrition.calories} cal
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
