import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantAPI } from '../../services/api';
import { mapRestaurantsFromBackend, mapRestaurantFromBackend } from '../../utils/restaurantMapper';

// Async thunks
export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching restaurants with filters:', filters);
      const response = await restaurantAPI.getRestaurants(filters);
      
      console.log('Restaurants API response:', response);
      
      // Handle nested response structure from backend
      const restaurants = response.data || response;
      
      // Map backend data to frontend format
      const mappedRestaurants = mapRestaurantsFromBackend(restaurants);
      
      return mappedRestaurants;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch restaurants';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchRestaurantById',
  async (restaurantId, { rejectWithValue }) => {
    try {
      console.log('Fetching restaurant by ID:', restaurantId);
      const response = await restaurantAPI.getRestaurantById(restaurantId);
      
      console.log('Restaurant API response:', response);
      
      // Handle nested response structure from backend
      const restaurant = response.data || response;
      
      // Map backend data to frontend format
      const mappedRestaurant = mapRestaurantFromBackend(restaurant);
      
      return mappedRestaurant;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Restaurant not found';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null,
  filters: {
    cuisine: '',
    search: '',
    isOpen: undefined
  }
};

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        cuisine: '',
        search: '',
        isOpen: undefined
      };
    },
    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch restaurant by ID
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearCurrentRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
