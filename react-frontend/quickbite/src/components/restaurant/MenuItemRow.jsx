import React from 'react';
import { Box, Paper, Typography, IconButton, Chip, Tooltip, Badge } from '@mui/material';
import { AccessTime, Add, Remove, LocalFireDepartment, Star } from '@mui/icons-material';
import ReadMoreText from '../common/ReadMoreText';

const MenuItemRow = ({ item, quantity, onAdd, onRemove, formatPrice, isRestaurantClosed = false }) => (
  <Paper sx={{ 
    p: 0, 
    display: 'flex', 
    alignItems: 'stretch', 
    gap: 0, 
    borderRadius: '16px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
    backgroundColor: isRestaurantClosed ? '#f5f5f5' : 'white', 
    border: '1px solid #f0f0f0', 
    minHeight: '160px', 
    width: '100%', 
    maxWidth: '100%', 
    minWidth: 0, 
    overflow: 'hidden', 
    boxSizing: 'border-box',
    position: 'relative',
    filter: isRestaurantClosed ? 'grayscale(100%)' : 'none',
    opacity: isRestaurantClosed ? 0.7 : 1,
    '&:hover': isRestaurantClosed ? {} : { 
      boxShadow: '0 12px 32px rgba(252, 128, 25, 0.15)', 
      transform: 'translateY(-4px)', 
      borderColor: '#fc8019',
      '& .menu-item-image': {
        transform: 'scale(1.05)'
      }
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: item.isPopular 
        ? 'linear-gradient(90deg, #fc8019 0%, #ff6b35 100%)' 
        : 'transparent',
      transition: 'all 0.3s ease'
    }
  }}>
    {/* Image Section */}
    <Box sx={{ 
      width: 120, 
      height: 160, 
      borderRadius: '16px 0 0 16px', 
      overflow: 'hidden', 
      position: 'relative', 
      flexShrink: 0, 
      backgroundColor: '#f5f5f5'
    }}>
      <img 
        src={item.image} 
        alt={item.name} 
        className="menu-item-image"
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          objectPosition: 'center', 
          display: 'block',
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
        fontSize: '12px', 
        fontWeight: 500 
      }}>
        No Image
      </Box>
      
      {/* Popular Badge */}
      {item.isPopular && (
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          left: 8, 
          background: 'linear-gradient(135deg, #ff6b35 0%, #fc8019 100%)',
          color: 'white', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: '12px', 
          fontSize: '10px', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
        }}>
          <LocalFireDepartment sx={{ fontSize: 12 }} />
          Popular
        </Box>
      )}

      {/* Veg/Non-Veg Badge */}
      <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '50%',
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography sx={{ 
          fontSize: 16, 
          color: item.isVeg ? '#4caf50' : '#f44336',
          fontWeight: 'bold'
        }}>
          {item.isVeg ? '🟢' : '🔴'}
        </Typography>
      </Box>
    </Box>

    {/* Content Section */}
    <Box sx={{ 
      flexGrow: 1, 
      minWidth: 0, 
      maxWidth: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between', 
      overflow: 'hidden', 
      boxSizing: 'border-box',
      p: 3
    }}>
      {/* Header */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#1a1a1a', 
            fontSize: '18px', 
            lineHeight: 1.3, 
            flex: 1, 
            mr: 2,
            minWidth: 0, 
            maxWidth: '100%', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
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
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#fc8019', 
              fontSize: '18px' 
            }}>
              {formatPrice(item.price)}
            </Typography>
          </Box>
        </Box>
        
        <ReadMoreText 
          text={item.description} 
          maxLength={120} 
          sx={{ 
            mb: 2, 
            width: '100%', 
            maxWidth: '100%', 
            minWidth: 0,
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#666'
          }} 
        />
      </Box>

      {/* Info Tags */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        {item.preparationTime && (
          <Chip
            icon={<AccessTime sx={{ fontSize: 14 }} />}
            label={`${item.preparationTime} min`}
            size="small"
            sx={{
              backgroundColor: '#f8f9fa',
              color: '#666',
              fontWeight: 600,
              fontSize: '12px',
              height: 28,
              borderRadius: '14px',
              border: '1px solid #e0e0e0',
              '& .MuiChip-icon': {
                color: '#666',
                fontSize: 14
              }
            }}
          />
        )}
        {item.nutrition && (
          <Chip
            label={`${item.nutrition.calories} cal`}
            size="small"
            sx={{
              backgroundColor: '#e8f5e8',
              color: '#4caf50',
              fontWeight: 600,
              fontSize: '12px',
              height: 28,
              borderRadius: '14px',
              border: '1px solid #c8e6c9'
            }}
          />
        )}
        {item.isPopular && (
          <Chip
            icon={<Star sx={{ fontSize: 14 }} />}
            label="Bestseller"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #fc8019 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '11px',
              height: 28,
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
              '& .MuiChip-icon': {
                color: 'white',
                fontSize: 14
              }
            }}
          />
        )}
      </Box>
    </Box>

    {/* Action Section */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5, 
      flexShrink: 0, 
      alignSelf: 'center',
      minWidth: 0, 
      maxWidth: '100%',
      pr: 3,
      py: 2
    }}>
      {quantity > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Remove">
            <IconButton 
              onClick={onRemove} 
              size="small" 
              sx={{ 
                border: '2px solid #fc8019', 
                color: '#fc8019', 
                width: '32px', 
                height: '32px',
                borderRadius: '50%',
                '&:hover': { 
                  backgroundColor: '#fff5f0',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Remove sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
          
          <Badge
            badgeContent={quantity}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#fc8019',
                color: 'white',
                fontWeight: 700,
                fontSize: '12px',
                minWidth: 24,
                height: 24,
                borderRadius: '12px'
              }
            }}
          >
            <Typography variant="body1" sx={{ 
              minWidth: 32, 
              textAlign: 'center', 
              fontWeight: 700, 
              fontSize: '16px', 
              color: '#333' 
            }}>
              {quantity}
            </Typography>
          </Badge>
        </Box>
      )}
      
      <Tooltip title={isRestaurantClosed ? "Restaurant is closed" : "Add to cart"}>
        <IconButton 
          onClick={isRestaurantClosed ? () => alert('This restaurant is currently closed. You cannot add items to cart.') : onAdd} 
          size="small" 
          disabled={isRestaurantClosed}
          sx={{ 
            background: isRestaurantClosed 
              ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
              : 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
            color: 'white', 
            width: '40px', 
            height: '40px',
            borderRadius: '50%',
            boxShadow: isRestaurantClosed ? 'none' : '0 4px 12px rgba(252, 128, 25, 0.3)',
            cursor: isRestaurantClosed ? 'not-allowed' : 'pointer',
            '&:hover': isRestaurantClosed ? {} : { 
              background: 'linear-gradient(135deg, #e6730a 0%, #e55a2b 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 16px rgba(252, 128, 25, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Add sx={{ fontSize: '20px' }} />
        </IconButton>
      </Tooltip>
    </Box>
  </Paper>
);

export default MenuItemRow;


