import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const EnhancedStatCard = ({ stat }) => {
  return (
    <Card sx={{ 
      height: 140,
      minWidth: 240,
      maxWidth: 240,
      background: '#fff',
      borderRadius: '6px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
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
      <CardContent sx={{ p: 2.25 }}>
        {/* Top: Icon only */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1.25 }}>
          <Box sx={{ 
            p: 1.25, 
            borderRadius: '6px', 
            background: `${stat.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(stat.icon, { 
              sx: { fontSize: 24, color: stat.color } 
            })}
          </Box>
        </Box>
        {/* Middle: Text left, Number right */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <Typography sx={{ 
              color: '#333',
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.2,
              mb: 0.25
            }}>
              {stat.title}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#666'
            }}>
              {stat.subtitle}
            </Typography>
          </Box>
          <Typography sx={{ 
            fontSize: 24, 
            fontWeight: 800, 
            color: '#333',
            lineHeight: 1.1,
            textAlign: 'right'
          }}>
            {stat.value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EnhancedStatCard;
