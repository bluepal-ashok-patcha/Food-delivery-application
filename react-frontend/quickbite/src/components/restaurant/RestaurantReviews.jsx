import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Divider, Button } from '@mui/material';

const RestaurantReviews = ({ restaurantId }) => {
  const reviews = useSelector((state) => state.reviews.data.restaurants[restaurantId] || []);
  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((a,b) => a + (b.rating || 0), 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const [expanded, setExpanded] = useState(false);

  return (
    <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Ratings & Reviews</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Average Rating: {avg} ({reviews.length} reviews)</Typography>
      <Divider sx={{ mb: 1 }} />
      {!expanded && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button size="small" onClick={() => setExpanded(true)} sx={{ textTransform: 'none', px: 0 }}>
            Read more
          </Button>
        </Box>
      )}
      {expanded && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {reviews.length === 0 && (
            <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
          )}
          {reviews.map((r, idx) => (
            <Box key={idx} sx={{ }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.userName} • {r.rating}★</Typography>
              <Typography variant="body2" color="text.secondary">{r.comment}</Typography>
              <Typography variant="caption" color="text.secondary">{r.date}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button size="small" onClick={() => setExpanded(false)} sx={{ textTransform: 'none', px: 0 }}>
              Show less
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RestaurantReviews;



