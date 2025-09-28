import React from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Box, Typography, Rating, TextField, Button, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { submitReview } from '../../store/slices/reviewSlice';
import { showNotification } from '../../store/slices/uiSlice';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const validationSchema = Yup.object({
  rating: Yup.number().min(1, 'Rating is required').required('Rating is required'),
  comment: Yup.string(),
});

const RatingModal = ({ open, onClose, order }) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      rating: 0,
      comment: '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      const review = {
        orderId: order.id,
        restaurantId: order.restaurantId,
        rating: values.rating,
        comment: values.comment,
      };
      dispatch(submitReview(review)).then(() => {
        dispatch(showNotification({ message: 'Review submitted!', type: 'success' }));
        setSubmitting(false);
        onClose();
      });
    },
  });

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Rate Your Order from {order.restaurantName}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Rating
            name="rating"
            value={formik.values.rating}
            onChange={(event, newValue) => {
              formik.setFieldValue('rating', newValue);
            }}
            size="large"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="comment"
            name="comment"
            label="Leave a review (optional)"
            multiline
            rows={4}
            value={formik.values.comment}
            onChange={formik.handleChange}
            variant="outlined"
            margin="normal"
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={formik.isSubmitting}
            sx={{ mt: 2 }}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default RatingModal;