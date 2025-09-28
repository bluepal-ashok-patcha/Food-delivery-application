import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Container, Typography, Chip, Rating, Button, Divider, Paper, Avatar } from '@mui/material';
import { Star, AccessTime } from '@mui/icons-material';
import { addItem } from '../../store/slices/cartSlice';
import { restaurants } from '../../data/restaurants'; // We'll get the restaurant data directly for now
import toast from 'react-hot-toast';

const RestaurantPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { reviews } = useSelector((state) => state.reviews);

  const restaurant = restaurants.find(r => r.id === parseInt(id));
  const restaurantReviews = reviews.filter(r => r.restaurantId === restaurant?.id);

  const averageRating = restaurantReviews.length > 0
    ? restaurantReviews.reduce((acc, review) => acc + review.rating, 0) / restaurantReviews.length
    : restaurant?.rating;

  if (!restaurant) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" align="center">Restaurant not found.</Typography>
      </Container>
    );
  }

  const handleAddItem = (item) => {
    dispatch(addItem({ ...item, restaurantName: restaurant.name }));
    toast.success(`${item.name} added to cart!`);
  };

  const menuCategories = restaurant.menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Restaurant Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            {restaurant.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Rating value={averageRating} readOnly precision={0.5} />
            <Typography variant="body1">{averageRating.toFixed(1)} stars ({restaurantReviews.length} reviews)</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {restaurant.address}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {restaurant.deliveryTime}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Menu */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Menu
        </Typography>
        {Object.entries(menuCategories).map(([category, items]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, borderBottom: '2px solid #ff6b35', pb: 1, display: 'inline-block' }}>
              {category}
            </Typography>
            <Box>
              {items.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                  <Box>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                    <Typography variant="h6" sx={{ mt: 1, color: '#333' }}>${item.price.toFixed(2)}</Typography>
                  </Box>
                  <Button variant="outlined" color="primary" onClick={() => handleAddItem(item)}>
                    Add
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        <Divider sx={{ my: 4 }} />

        {/* Ratings and Reviews */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Ratings & Reviews
        </Typography>
        {restaurantReviews.length > 0 ? (
          restaurantReviews.map((review) => (
            <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2 }}>U</Avatar> {/* Mock User */}
                <Typography variant="h6">User Name</Typography>
              </Box>
              <Rating value={review.rating} readOnly />
              <Typography variant="body1" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography>No reviews yet.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default RestaurantPage;