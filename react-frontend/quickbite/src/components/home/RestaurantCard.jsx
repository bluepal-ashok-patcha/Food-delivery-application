import React from 'react';
import { Card, CardContent, IconButton, Box, Typography } from '@mui/material';
import { FavoriteBorder, Star } from '@mui/icons-material';
import ReadMoreText from '../common/ReadMoreText';

const RestaurantCard = ({ restaurant, onClick, formatPrice }) => (
  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }, maxWidth: { xs: '400px', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' }, minWidth: { xs: '300px', sm: '280px', md: '280px' }, flex: '0 0 auto' }}>
    <Card
      sx={{ cursor: 'pointer', height: '380px', width: '100%', minWidth: 0, maxWidth: '100%', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'white', flex: '1 1 auto', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' } }}
      onClick={() => onClick(restaurant.id)}
    >
      <Box sx={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5f5f5' }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <Box sx={{ display: 'none', width: '100%', height: '100%', backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px', fontWeight: 500 }}>No Image</Box>
        {restaurant.offers && restaurant.offers.length > 0 && (
          <Box sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#ff6b35', color: 'white', px: 1.5, py: 0.5, borderRadius: '4px', fontSize: '10px', fontWeight: 600, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {restaurant.offers[0].title}
          </Box>
        )}
        <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', width: '28px', height: '28px', '&:hover': { backgroundColor: 'white' } }}>
          <FavoriteBorder sx={{ fontSize: '16px', color: '#666' }} />
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, mr: 1, minWidth: 0, maxWidth: '100%' }}>
              {restaurant.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, backgroundColor: '#f8f9fa', px: 1, py: 0.5, borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              <Star sx={{ fontSize: 14, color: '#ffc107' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>{restaurant.rating}</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '13px', color: '#666', fontWeight: 500 }}>
            {restaurant.cuisine} • {restaurant.deliveryTime}
          </Typography>
          <ReadMoreText text={restaurant.description} maxLength={80} sx={{ flex: 1, width: '100%', maxWidth: '100%', minWidth: 0 }} />
        </Box>
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
);

export default RestaurantCard;


