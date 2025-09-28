import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurants as allRestaurants } from '../../data/restaurants';

// Mock API call
const fetchRestaurantsAPI = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRestaurants = allRestaurants;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredRestaurants = filteredRestaurants.filter(
          (r) =>
            r.name.toLowerCase().includes(searchTerm) ||
            r.menu.some((item) => item.name.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.cuisine) {
        filteredRestaurants = filteredRestaurants.filter((r) =>
          r.categories.includes(filters.cuisine)
        );
      }

      resolve(filteredRestaurants);
    }, 300);
  });
};

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (filters) => {
    const response = await fetchRestaurantsAPI(filters);
    return response;
  }
);

const initialState = {
  all: [],
  filtered: [],
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
        if (state.all.length === 0) {
          state.all = action.payload;
        }
        state.filtered = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default restaurantSlice.reducer;