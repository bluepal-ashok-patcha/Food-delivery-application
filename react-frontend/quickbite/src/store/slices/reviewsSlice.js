import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantAPI } from '../../services/api';

// Mock initial data
const initialReviews = {
  restaurants: {
    // restaurantId: [{ rating, comment, userName, date }]
    1: [
      { rating: 5, comment: 'Amazing food and quick delivery!', userName: 'Ashok', date: '2025-01-15' },
      { rating: 4, comment: 'Tasty but a bit spicy.', userName: 'Priya', date: '2025-01-20' }
    ]
  },
  partners: {
    // partnerId: [{ rating, comment, userName, date }]
    4: [
      { rating: 5, comment: 'On time and very polite.', userName: 'Ashok', date: '2025-01-15' }
    ]
  }
};

export const submitRestaurantReview = createAsyncThunk(
  'reviews/submitRestaurantReview',
  async ({ restaurantId, orderId, rating, comment, userName }, { rejectWithValue }) => {
    try {
      console.log('Submitting restaurant review:', { restaurantId, orderId, rating, comment });
      const reviewData = { orderId, rating, comment };
      console.log('Review data being sent:', reviewData);
      const response = await restaurantAPI.addReview(restaurantId, reviewData);
      console.log('Review response:', response);
      return { restaurantId, review: { rating, comment, userName, date: new Date().toISOString().slice(0,10) } };
    } catch (e) {
      console.error('Review submission error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      return rejectWithValue(e.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const submitPartnerReview = createAsyncThunk(
  'reviews/submitPartnerReview',
  async ({ partnerId, orderId, rating, comment, userName }, { rejectWithValue }) => {
    try {
      console.log('Submitting delivery partner review:', { partnerId, orderId, rating, comment });
      const reviewData = { orderId, rating, comment };
      console.log('Delivery review data being sent:', reviewData);
      const response = await restaurantAPI.addDeliveryPartnerReview(partnerId, reviewData);
      console.log('Delivery review response:', response);
      return { partnerId, review: { rating, comment, userName, date: new Date().toISOString().slice(0,10) } };
    } catch (e) {
      console.error('Delivery review submission error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      return rejectWithValue(e.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const fetchRestaurantReviews = createAsyncThunk(
  'reviews/fetchRestaurantReviews',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getRestaurantReviews(restaurantId);
      const payload = response.data || response;
      // Normalize to [{ rating, comment, userName, date }]
      const reviews = (payload || []).map((r) => ({
        rating: r.rating || r.stars || 0,
        comment: r.comment || r.review || r.text || '',
        userName: r.userName || r.user || r.author || 'Anonymous',
        date: r.createdAt || r.date || ''
      }));
      return { restaurantId, reviews };
    } catch (e) {
      return rejectWithValue('Failed to fetch reviews');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    data: initialReviews,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantReviews.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRestaurantReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { restaurantId, reviews } = action.payload;
        state.data.restaurants[restaurantId] = reviews;
      })
      .addCase(fetchRestaurantReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(submitRestaurantReview.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitRestaurantReview.fulfilled, (state, action) => {
        state.loading = false;
        const { restaurantId, review } = action.payload;
        if (!state.data.restaurants[restaurantId]) state.data.restaurants[restaurantId] = [];
        state.data.restaurants[restaurantId].unshift(review);
      })
      .addCase(submitRestaurantReview.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(submitPartnerReview.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitPartnerReview.fulfilled, (state, action) => {
        state.loading = false;
        const { partnerId, review } = action.payload;
        if (!state.data.partners[partnerId]) state.data.partners[partnerId] = [];
        state.data.partners[partnerId].unshift(review);
      })
      .addCase(submitPartnerReview.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default reviewsSlice.reducer;



