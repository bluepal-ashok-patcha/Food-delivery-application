import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const EnhancedStatCard = ({ stat }) => {
  return (
    <Card sx={{ 
      height: '100%',
      background: '#fff',
      borderRadius: '4px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(252, 128, 25, 0.15)'
      },
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '4px',
        background: `linear-gradient(90deg, ${stat.color}, ${stat.color}dd)`
      }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: '4px', 
            background: `${stat.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(stat.icon, { 
              sx: { fontSize: 28, color: stat.color } 
            })}
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {stat.trend === 'up' ? 
                <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} /> : 
                <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
              }
              <Typography variant="body2" sx={{ 
                color: stat.trend === 'up' ? '#4caf50' : '#f44336',
                fontWeight: 600
              }}>
                {stat.change}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Typography variant="h4" sx={{ 
          fontWeight: 800, 
          color: '#333',
          mb: 0.5
        }}>
          {stat.value}
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#333',
          fontWeight: 600,
          mb: 0.5
        }}>
          {stat.title}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#666',
          fontSize: '14px'
        }}>
          {stat.subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EnhancedStatCard;
