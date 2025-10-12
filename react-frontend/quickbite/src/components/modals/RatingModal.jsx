import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import { Close, Restaurant, LocalShipping, Star } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { submitRestaurantReview, submitPartnerReview } from '../../store/slices/reviewsSlice';
import { showNotification } from '../../store/slices/uiSlice';

const RatingModal = ({ open, onClose, order, assignment, onReviewSubmitted }) => {
  const dispatch = useDispatch();
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState('');
  const [deliveryComment, setDeliveryComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate that at least one rating is provided
    if (restaurantRating === 0 && deliveryRating === 0) {
      dispatch(showNotification({
        message: 'Please provide at least one rating before submitting.',
        type: 'warning'
      }));
      return;
    }

    setSubmitting(true);
    try {
      // Submit restaurant review only if rating is provided
      if (order?.restaurantId && restaurantRating > 0) {
        await dispatch(submitRestaurantReview({
          restaurantId: order.restaurantId,
          orderId: order.id,
          rating: restaurantRating,
          comment: restaurantComment,
          userName: 'You'
        }));
      }

      // Submit delivery partner review only if rating is provided
      if (assignment?.deliveryPartnerId && deliveryRating > 0) {
        await dispatch(submitPartnerReview({
          partnerId: assignment.deliveryPartnerId,
          orderId: order.id,
          rating: deliveryRating,
          comment: deliveryComment,
          userName: 'You'
        }));
      }

          dispatch(showNotification({
            message: 'Thank you for your feedback! Your ratings help us improve.',
            type: 'success'
          }));
          
          // Call the callback to refresh review status
          if (onReviewSubmitted) {
            onReviewSubmitted();
          }
          
          onClose();
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to submit ratings. Please try again.',
        type: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      0: 'Select Rating',
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || 'Select Rating';
  };

  const getRatingColor = (rating) => {
    if (rating === 0) return '#9e9e9e';
    if (rating >= 4) return '#4caf50';
    if (rating >= 3) return '#ff9800';
    return '#f44336';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '3px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #fc8019 0%, #e6730a 100%)',
        color: 'white',
        borderRadius: '3px 3px 0 0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star sx={{ fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Rate Your Experience
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Help us improve by rating your order experience
        </Typography>

        {/* Restaurant Rating Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#fc8019', 
              width: 48, 
              height: 48,
              boxShadow: '0 4px 12px rgba(252,128,25,0.3)'
            }}>
              <Restaurant />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Restaurant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order?.restaurantName || 'Restaurant'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating
              value={restaurantRating}
              onChange={(event, newValue) => setRestaurantRating(newValue)}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#fc8019'
                }
              }}
            />
            <Chip 
              label={getRatingText(restaurantRating)} 
              sx={{ 
                bgcolor: getRatingColor(restaurantRating),
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Share your experience with the food quality, taste, and service..."
            value={restaurantComment}
            onChange={(e) => setRestaurantComment(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '3px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fc8019'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fc8019'
                }
              }
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Delivery Partner Rating Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#2196f3', 
              width: 48, 
              height: 48,
              boxShadow: '0 4px 12px rgba(33,150,243,0.3)'
            }}>
              <LocalShipping />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Delivery Partner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assignment?.deliveryPartnerName || 'Delivery Partner'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating
              value={deliveryRating}
              onChange={(event, newValue) => setDeliveryRating(newValue)}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#2196f3'
                }
              }}
            />
            <Chip 
              label={getRatingText(deliveryRating)} 
              sx={{ 
                bgcolor: getRatingColor(deliveryRating),
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="How was the delivery experience? Was it on time and professional?"
            value={deliveryComment}
            onChange={(e) => setDeliveryComment(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '3px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2196f3'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2196f3'
                }
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={{
              textTransform: 'none',
              borderRadius: '3px',
              py: 1.5,
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#ccc',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Skip for Now
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || (restaurantRating === 0 && deliveryRating === 0)}
            sx={{
              textTransform: 'none',
              borderRadius: '3px',
              py: 1.5,
              background: 'linear-gradient(135deg, #fc8019 0%, #e6730a 100%)',
              boxShadow: '0 4px 12px rgba(252,128,25,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #e6730a 0%, #d65a00 100%)',
                boxShadow: '0 6px 16px rgba(252,128,25,0.4)'
              },
              '&:disabled': {
                background: '#ccc',
                boxShadow: 'none'
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
