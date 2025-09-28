import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API call
const submitReviewAPI = (review) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Review submitted:', review);
      resolve({ ...review, id: Date.now() });
    }, 500);
  });
};

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (review) => {
    const response = await submitReviewAPI(review);
    return response;
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.push(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default reviewSlice.reducer;