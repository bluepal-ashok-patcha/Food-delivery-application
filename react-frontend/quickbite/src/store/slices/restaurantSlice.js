import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockRestaurants } from '../../constants/mockData';

// Async thunks
export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredRestaurants = [...mockRestaurants];
      
      if (filters.cuisine) {
        filteredRestaurants = filteredRestaurants.filter(
          restaurant => restaurant.cuisine.toLowerCase() === filters.cuisine.toLowerCase()
        );
      }
      
      if (filters.search) {
        filteredRestaurants = filteredRestaurants.filter(
          restaurant => 
            restaurant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            restaurant.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.isOpen !== undefined) {
        filteredRestaurants = filteredRestaurants.filter(
          restaurant => restaurant.isOpen === filters.isOpen
        );
      }
      
      return filteredRestaurants;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchRestaurantById',
  async (restaurantId, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const restaurant = mockRestaurants.find(r => r.id === parseInt(restaurantId));
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      return restaurant;
    } catch (error) {
      return rejectWithValue(error.message);
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
