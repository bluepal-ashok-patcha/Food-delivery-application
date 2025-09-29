import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const StatCard = ({ color, value, title, icon }) => (
  <Card sx={{ backgroundColor: color, color: 'white' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>{title}</Typography>
        </Box>
        <Box sx={{ opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;


