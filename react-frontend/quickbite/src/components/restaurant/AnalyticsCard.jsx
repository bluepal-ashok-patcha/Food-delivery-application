import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const AnalyticsCard = ({ title, data }) => {
  return (
    <Paper sx={{ 
      p: 3,
      borderRadius: '4px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      background: '#fff',
      height: '100%'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
              {item.label}
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default AnalyticsCard;
