import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
  async ({ restaurantId, rating, comment, userName }, { rejectWithValue }) => {
    try {
      await new Promise(res => setTimeout(res, 500));
      return { restaurantId, review: { rating, comment, userName, date: new Date().toISOString().slice(0,10) } };
    } catch (e) {
      return rejectWithValue('Failed to submit review');
    }
  }
);

export const submitPartnerReview = createAsyncThunk(
  'reviews/submitPartnerReview',
  async ({ partnerId, rating, comment, userName }, { rejectWithValue }) => {
    try {
      await new Promise(res => setTimeout(res, 500));
      return { partnerId, review: { rating, comment, userName, date: new Date().toISOString().slice(0,10) } };
    } catch (e) {
      return rejectWithValue('Failed to submit review');
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



