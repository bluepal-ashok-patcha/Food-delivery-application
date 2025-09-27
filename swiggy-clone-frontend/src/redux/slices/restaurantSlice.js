import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockRestaurants } from '../../Api/mockRestaurants';

// Mock async thunk to fetch restaurants
export const fetchRestaurants = createAsyncThunk('restaurants/fetchRestaurants', async () => {
  // Simulate an API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockRestaurants);
    }, 500); // 500ms delay to simulate network latency
  });
});

const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default restaurantSlice.reducer;