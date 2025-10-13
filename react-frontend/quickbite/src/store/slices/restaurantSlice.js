import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantAPI, orderAPI } from '../../services/api';
import { mapRestaurantsFromBackend, mapRestaurantFromBackend } from '../../utils/restaurantMapper';
import { showNotification } from './uiSlice';

// Async thunks
export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching restaurants with filters:', filters);
      const response = await restaurantAPI.getRestaurants(filters);
      
      console.log('Restaurants API response:', response);
      
      // Handle nested response structure from backend
      // Backend returns: { success: true, message: "...", data: [...restaurants...], page: {...} }
      const restaurants = response.data?.data || response.data || response;
      
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
      // Backend returns: { success: true, message: "...", data: {...restaurant...} }
      const restaurant = response.data?.data || response.data || response;
      
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

// Restaurant Owner thunks
export const fetchMyRestaurants = createAsyncThunk(
  'restaurants/fetchMyRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getMyRestaurants();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my restaurants');
    }
  }
);

export const updateRestaurantProfile = createAsyncThunk(
  'restaurants/updateRestaurantProfile',
  async ({ restaurantId, restaurantData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.updateRestaurantProfile(restaurantId, restaurantData);
      dispatch(showNotification({ message: 'Restaurant profile updated successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update restaurant profile', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant profile');
    }
  }
);

export const toggleRestaurantOpen = createAsyncThunk(
  'restaurants/toggleRestaurantOpen',
  async ({ restaurantId, isOpen }, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.setRestaurantOpen(restaurantId, isOpen);
      dispatch(showNotification({ message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`, type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update restaurant status', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant status');
    }
  }
);

export const fetchRestaurantCategories = createAsyncThunk(
  'restaurants/fetchRestaurantCategories',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getRestaurantCategories(restaurantId);
      const categories = response.data || response;
      
      // Map backend data to frontend format
      const mappedCategories = categories.map(category => ({
        ...category,
        menuItems: (category.menuItems || []).map(item => ({
          ...item,
          image: item.imageUrl || '/api/placeholder/200/150',
          inStock: item.inStock !== false,
          isVeg: item.isVeg || false,
          isPopular: item.isPopular || false,
          preparationTime: item.preparationTime || 15,
          customizationJson: item.customizationJson || '{}',
          nutritionJson: item.nutritionJson || '{}',
          // Add parsed objects for frontend compatibility
          customization: item.customizationJson ? JSON.parse(item.customizationJson) : [],
          nutrition: item.nutritionJson ? JSON.parse(item.nutritionJson) : {}
        }))
      }));
      
      return mappedCategories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const addMenuCategory = createAsyncThunk(
  'restaurants/addMenuCategory',
  async ({ restaurantId, categoryData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.addMenuCategory(restaurantId, categoryData);
      dispatch(showNotification({ message: 'Menu category added successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to add menu category', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to add menu category');
    }
  }
);

export const updateMenuCategory = createAsyncThunk(
  'restaurants/updateMenuCategory',
  async ({ categoryId, categoryData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.updateMenuCategory(categoryId, categoryData);
      dispatch(showNotification({ message: 'Menu category updated successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update menu category', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu category');
    }
  }
);

export const deleteMenuCategory = createAsyncThunk(
  'restaurants/deleteMenuCategory',
  async (categoryId, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.deleteMenuCategory(categoryId);
      dispatch(showNotification({ message: 'Menu category deleted successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete menu category', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu category');
    }
  }
);

export const addMenuItem = createAsyncThunk(
  'restaurants/addMenuItem',
  async ({ categoryId, itemData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.addMenuItem(categoryId, itemData);
      dispatch(showNotification({ message: 'Menu item added successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to add menu item', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to add menu item');
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'restaurants/updateMenuItem',
  async ({ itemId, itemData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.updateMenuItem(itemId, itemData);
      dispatch(showNotification({ message: 'Menu item updated successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update menu item', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu item');
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'restaurants/deleteMenuItem',
  async (itemId, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.deleteMenuItem(itemId);
      dispatch(showNotification({ message: 'Menu item deleted successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete menu item', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu item');
    }
  }
);

export const createRestaurant = createAsyncThunk(
  'restaurants/createRestaurant',
  async (restaurantData, { rejectWithValue, dispatch }) => {
    try {
      const response = await restaurantAPI.applyAsRestaurantOwner(restaurantData);
      dispatch(showNotification({ message: 'Restaurant application submitted successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to create restaurant', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to create restaurant');
    }
  }
);

export const fetchRestaurantOrders = createAsyncThunk(
  'restaurants/fetchRestaurantOrders',
  async ({ restaurantId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getRestaurantOrders(restaurantId, filters);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'restaurants/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, status);
      dispatch(showNotification({ message: 'Order status updated successfully', type: 'success' }));
      return response.data || response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update order status', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const fetchRestaurantAnalytics = createAsyncThunk(
  'restaurants/fetchRestaurantAnalytics',
  async ({ restaurantId, period = 'week' }, { rejectWithValue }) => {
    try {
      const response = await restaurantAPI.getRestaurantAnalytics(restaurantId, period);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  myRestaurants: [],
  categories: [],
  orders: [],
  analytics: null,
  loading: {
    restaurants: false,
    myRestaurants: false,
    categories: false,
    profile: false,
    menu: false,
    orders: false,
    analytics: false
  },
  error: {
    restaurants: null,
    myRestaurants: null,
    categories: null,
    profile: null,
    menu: null,
    orders: null,
    analytics: null
  },
  filters: {
    cuisine: '',
    search: '',
    isOpen: undefined,
    isPureVeg: undefined
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
    },
    setCurrentRestaurant: (state, action) => {
      state.currentRestaurant = action.payload;
    },
    clearCategories: (state) => {
      state.categories = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading.restaurants = true;
        state.error.restaurants = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading.restaurants = false;
        state.restaurants = action.payload;
        state.error.restaurants = null;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading.restaurants = false;
        state.error.restaurants = action.payload;
      })
      // Fetch restaurant by ID
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading.restaurants = true;
        state.error.restaurants = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading.restaurants = false;
        state.currentRestaurant = action.payload;
        state.error.restaurants = null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading.restaurants = false;
        state.error.restaurants = action.payload;
      })
      // Fetch my restaurants
      .addCase(fetchMyRestaurants.pending, (state) => {
        state.loading.myRestaurants = true;
        state.error.myRestaurants = null;
      })
      .addCase(fetchMyRestaurants.fulfilled, (state, action) => {
        state.loading.myRestaurants = false;
        state.myRestaurants = action.payload;
        state.error.myRestaurants = null;
      })
      .addCase(fetchMyRestaurants.rejected, (state, action) => {
        state.loading.myRestaurants = false;
        state.error.myRestaurants = action.payload;
      })
      // Update restaurant profile
      .addCase(updateRestaurantProfile.pending, (state) => {
        state.loading.profile = true;
        state.error.profile = null;
      })
      .addCase(updateRestaurantProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        // Update the restaurant in myRestaurants array
        const index = state.myRestaurants.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.myRestaurants[index] = action.payload;
        }
        state.error.profile = null;
      })
      .addCase(updateRestaurantProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error.profile = action.payload;
      })
      // Toggle restaurant open
      .addCase(toggleRestaurantOpen.fulfilled, (state, action) => {
        // Update the restaurant in myRestaurants array
        const index = state.myRestaurants.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.myRestaurants[index] = action.payload;
        }
      })
      // Fetch restaurant categories
      .addCase(fetchRestaurantCategories.pending, (state) => {
        state.loading.categories = true;
        state.error.categories = null;
      })
      .addCase(fetchRestaurantCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        state.categories = action.payload;
        state.error.categories = null;
      })
      .addCase(fetchRestaurantCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error.categories = action.payload;
      })
      // Menu category operations
      .addCase(addMenuCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateMenuCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteMenuCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload.id);
      })
      // Menu item operations
      .addCase(addMenuItem.fulfilled, (state, action) => {
        // Find the category and add the item
        const categoryIndex = state.categories.findIndex(c => c.id === action.payload.categoryId);
        if (categoryIndex !== -1) {
          if (!state.categories[categoryIndex].menuItems) {
            state.categories[categoryIndex].menuItems = [];
          }
          state.categories[categoryIndex].menuItems.push(action.payload);
        }
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        // Find and update the item in categories
        state.categories.forEach(category => {
          if (category.menuItems) {
            const itemIndex = category.menuItems.findIndex(item => item.id === action.payload.id);
            if (itemIndex !== -1) {
              category.menuItems[itemIndex] = action.payload;
            }
          }
        });
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        // Remove the item from categories
        state.categories.forEach(category => {
          if (category.menuItems) {
            category.menuItems = category.menuItems.filter(item => item.id !== action.payload.id);
          }
        });
      })
      // Create restaurant
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.myRestaurants.push(action.payload);
      })
      // Fetch restaurant orders
      .addCase(fetchRestaurantOrders.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(fetchRestaurantOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload;
        state.error.orders = null;
      })
      .addCase(fetchRestaurantOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload;
      })
      // Analytics
      .addCase(fetchRestaurantAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error.analytics = null;
      })
      .addCase(fetchRestaurantAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchRestaurantAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error.analytics = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });
  }
});

export const { setFilters, clearFilters, clearCurrentRestaurant, setCurrentRestaurant, clearCategories } = restaurantSlice.actions;
export default restaurantSlice.reducer;
