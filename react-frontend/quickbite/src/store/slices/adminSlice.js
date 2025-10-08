import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI, deliveryAPI } from '../../services/api';
import { showNotification } from './uiSlice';

const initialState = {
  // Data
  users: [],
  restaurants: [],
  orders: [],
  partners: [],
  coupons: [],
  transactions: [],
  
  // Loading states
  loading: {
    users: false,
    restaurants: false,
    orders: false,
    partners: false,
    coupons: false,
    transactions: false,
  },
  
  // Error states
  error: {
    users: null,
    restaurants: null,
    orders: null,
    partners: null,
    coupons: null,
    transactions: null,
  },
  
  // Pagination
  pagination: {
    users: { page: 0, size: 10, total: 0 },
    restaurants: { page: 0, size: 10, total: 0 },
    orders: { page: 0, size: 10, total: 0 },
    partners: { page: 0, size: 10, total: 0 },
    coupons: { page: 0, size: 10, total: 0 },
  },
  
  // Analytics
  analytics: {
    restaurant: null,
    order: null,
    delivery: null,
    payment: null,
  },
  
  // Commissions
  commissions: {
    defaultRatePercent: 10,
    restaurantOverrides: {}
  },
};

// Async Thunks
const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllUsers(page, size);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

const createUser = createAsyncThunk(
  'admin/createUser',
  async ({ userData, role = 'CUSTOMER' }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.createUser(userData, role);
      dispatch(showNotification({ message: 'User created successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to create user', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.updateUser(id, userData);
      dispatch(showNotification({ message: 'User updated successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update user', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ id, isActive }, { rejectWithValue, dispatch }) => {
    try {
      const response = isActive 
        ? await adminAPI.activateUser(id)
        : await adminAPI.deactivateUser(id);
      dispatch(showNotification({ 
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, 
        type: 'success' 
      }));
      return response;
    } catch (error) {
      dispatch(showNotification({ 
        message: error.response?.data?.message || `Failed to ${isActive ? 'activate' : 'deactivate'} user`, 
        type: 'error' 
      }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

const fetchRestaurants = createAsyncThunk(
  'admin/fetchRestaurants',
  async ({ page = 0, size = 10, status = null } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllRestaurants(page, size, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

const fetchPendingRestaurants = createAsyncThunk(
  'admin/fetchPendingRestaurants',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingRestaurants(page, size);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending restaurants');
    }
  }
);

const approveRestaurant = createAsyncThunk(
  'admin/approveRestaurant',
  async ({ restaurantId, approvalData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.approveRestaurant(restaurantId, approvalData);
      dispatch(showNotification({ message: 'Restaurant approved successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to approve restaurant', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to approve restaurant');
    }
  }
);

const rejectRestaurant = createAsyncThunk(
  'admin/rejectRestaurant',
  async ({ restaurantId, rejectionData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.rejectRestaurant(restaurantId, rejectionData);
      dispatch(showNotification({ message: 'Restaurant rejected', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to reject restaurant', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to reject restaurant');
    }
  }
);

const updateRestaurantStatus = createAsyncThunk(
  'admin/updateRestaurantStatus',
  async ({ restaurantId, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.updateRestaurantStatus(restaurantId, status);
      dispatch(showNotification({ message: 'Restaurant status updated successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update restaurant status', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant status');
    }
  }
);

// Lightweight toggles for open/active without full profile payload
const setRestaurantOpenAsync = createAsyncThunk(
  'admin/setRestaurantOpenAsync',
  async ({ restaurantId, isOpen }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.setRestaurantOpen(restaurantId, isOpen);
      dispatch(showNotification({ message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`, type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to toggle open/closed', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle open/closed');
    }
  }
);

const setRestaurantActiveAsync = createAsyncThunk(
  'admin/setRestaurantActiveAsync',
  async ({ restaurantId, isActive }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.setRestaurantActive(restaurantId, isActive);
      dispatch(showNotification({ message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`, type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to toggle active', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle active');
    }
  }
);

const createRestaurant = createAsyncThunk(
  'admin/createRestaurant',
  async (restaurantData, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.createRestaurant(restaurantData);
      dispatch(showNotification({ message: 'Restaurant created successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to create restaurant', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to create restaurant');
    }
  }
);

const updateRestaurantProfile = createAsyncThunk(
  'admin/updateRestaurantProfile',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.updateRestaurantProfile(id, data);
      dispatch(showNotification({ message: 'Restaurant updated successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update restaurant', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant');
    }
  }
);

const fetchOrders = createAsyncThunk(
  'admin/fetchOrders',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllOrders(page, size);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, status);
      dispatch(showNotification({ message: 'Order status updated successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update order status', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Create or update delivery assignment for an order (admin/owner)
const assignOrderToPartner = createAsyncThunk(
  'admin/assignOrderToPartner',
  async ({ orderId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await deliveryAPI.createAssignment(orderId);
      dispatch(showNotification({ message: 'Order assigned to partner successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to assign order to partner', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to assign order to partner');
    }
  }
);

const fetchDeliveryPartners = createAsyncThunk(
  'admin/fetchDeliveryPartners',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch pending partners (includes both pending applications and offline partners)
      const response = await adminAPI.getPendingPartners();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery partners');
    }
  }
);

const fetchAllDeliveryPartners = createAsyncThunk(
  'admin/fetchAllDeliveryPartners',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch both pending and available partners
      const [pendingResponse, availableResponse] = await Promise.all([
        adminAPI.getPendingPartners(),
        adminAPI.getAvailablePartners()
      ]);
      
      const pending = pendingResponse?.data || [];
      const available = availableResponse?.data || [];
      
      // Combine both lists, avoiding duplicates and marking pending partners
      const allPartners = [...pending.map(p => ({ ...p, isPending: true }))];
      available.forEach(partner => {
        if (!allPartners.find(p => p.userId === partner.userId)) {
          allPartners.push({ ...partner, isPending: false });
        }
      });
      
      return { data: allPartners };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all delivery partners');
    }
  }
);

const approveDeliveryPartner = createAsyncThunk(
  'admin/approveDeliveryPartner',
  async (partnerUserId, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.approveDeliveryPartner(partnerUserId);
      dispatch(showNotification({ message: 'Delivery partner approved successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to approve delivery partner', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to approve delivery partner');
    }
  }
);

const rejectDeliveryPartner = createAsyncThunk(
  'admin/rejectDeliveryPartner',
  async (partnerUserId, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.rejectDeliveryPartner(partnerUserId);
      dispatch(showNotification({ message: 'Delivery partner rejected', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to reject delivery partner', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to reject delivery partner');
    }
  }
);

const fetchCoupons = createAsyncThunk(
  'admin/fetchCoupons',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllCoupons(page, size);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

const createCoupon = createAsyncThunk(
  'admin/createCoupon',
  async (couponData, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.createCoupon(couponData);
      dispatch(showNotification({ message: 'Coupon created successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to create coupon', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to create coupon');
    }
  }
);

const updateCoupon = createAsyncThunk(
  'admin/updateCoupon',
  async ({ couponId, couponData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.updateCoupon(couponId, couponData);
      dispatch(showNotification({ message: 'Coupon updated successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to update coupon', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to update coupon');
    }
  }
);

const deleteCoupon = createAsyncThunk(
  'admin/deleteCoupon',
  async (couponId, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminAPI.deleteCoupon(couponId);
      dispatch(showNotification({ message: 'Coupon deleted successfully', type: 'success' }));
      return response;
    } catch (error) {
      dispatch(showNotification({ message: error.response?.data?.message || 'Failed to delete coupon', type: 'error' }));
      return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon');
    }
  }
);

const fetchTransactions = createAsyncThunk(
  'admin/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllTransactions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async ({ type, period = 'week', restaurantId = null }, { rejectWithValue }) => {
    try {
      let response;
      switch (type) {
        case 'restaurant':
          if (restaurantId) {
            response = await adminAPI.getRestaurantAnalytics(restaurantId, period);
          } else {
            response = await adminAPI.getRestaurantAnalyticsSummary(period);
          }
          break;
        case 'order':
          response = await adminAPI.getOrderAnalytics(period);
          break;
        case 'delivery':
          response = await adminAPI.getDeliveryAnalyticsSummary(period);
          break;
        case 'payment':
          response = await adminAPI.getPaymentAnalytics(period);
          break;
        default:
          throw new Error('Invalid analytics type');
      }
      return { type, data: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Users
    activateUser(state, action) {
      const user = state.users.find(u => u.id === action.payload);
      if (user) user.isActive = true;
    },
    deactivateUser(state, action) {
      const user = state.users.find(u => u.id === action.payload);
      if (user) user.isActive = false;
    },
    resetUserPassword(state, action) {
      const { userId, newPassword } = action.payload;
      const user = state.users.find(u => u.id === userId);
      if (user) user.password = newPassword;
    },
    addUser: {
      reducer(state, action) {
        state.users.push(action.payload);
      },
      prepare(user) {
        return { payload: { id: nanoid(), isActive: true, role: 'CUSTOMER', ...user } };
      }
    },
    deleteUser(state, action) {
      state.users = state.users.filter(u => u.id !== action.payload);
    },

    // Restaurants
    addRestaurant: {
      reducer(state, action) {
        state.restaurants.push(action.payload);
      },
      prepare(restaurant) {
        return { payload: { id: nanoid(), isActive: true, isOpen: false, isApproved: false, menu: [], offers: [], ...restaurant } };
      }
    },
    updateRestaurant(state, action) {
      const { id, changes } = action.payload;
      const idx = state.restaurants.findIndex(r => r.id === id);
      if (idx !== -1) state.restaurants[idx] = { ...state.restaurants[idx], ...changes };
    },
    deleteRestaurant(state, action) {
      state.restaurants = state.restaurants.filter(r => r.id !== action.payload);
    },
    setRestaurantActive(state, action) {
      const { id, isActive } = action.payload;
      const r = state.restaurants.find(x => x.id === id);
      if (r) r.isActive = isActive;
    },
    setRestaurantOpen(state, action) {
      const { id, isOpen } = action.payload;
      const r = state.restaurants.find(x => x.id === id);
      if (r) r.isOpen = isOpen;
    },

    // Menu categories and items (admin or owner)
    addMenuCategory(state, action) {
      const { restaurantId, category } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      const newCategory = { id: nanoid(), items: [], ...category };
      r.menu = [...(r.menu || []), newCategory];
    },
    updateMenuCategory(state, action) {
      const { restaurantId, categoryId, changes } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      const idx = (r.menu || []).findIndex(c => c.id === categoryId);
      if (idx !== -1) r.menu[idx] = { ...r.menu[idx], ...changes };
    },
    deleteMenuCategory(state, action) {
      const { restaurantId, categoryId } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      r.menu = (r.menu || []).filter(c => c.id !== categoryId);
    },
    addMenuItem(state, action) {
      const { restaurantId, categoryId, item } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      const cat = (r.menu || []).find(c => c.id === categoryId);
      if (!cat) return;
      cat.items = [...(cat.items || []), { id: nanoid(), isAvailable: true, ...item }];
    },
    updateMenuItem(state, action) {
      const { restaurantId, categoryId, itemId, changes } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      const cat = (r.menu || []).find(c => c.id === categoryId);
      if (!cat) return;
      const idx = (cat.items || []).findIndex(i => i.id === itemId);
      if (idx !== -1) cat.items[idx] = { ...cat.items[idx], ...changes };
    },
    deleteMenuItem(state, action) {
      const { restaurantId, categoryId, itemId } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      const cat = (r.menu || []).find(c => c.id === categoryId);
      if (!cat) return;
      cat.items = (cat.items || []).filter(i => i.id !== itemId);
    },
    toggleMenuItemAvailability(state, action) {
      const { restaurantId, categoryId, itemId } = action.payload;
      const r = state.restaurants.find(x => x.id === restaurantId);
      if (!r) return;
      const cat = (r.menu || []).find(c => c.id === categoryId);
      if (!cat) return;
      const item = (cat.items || []).find(i => i.id === itemId);
      if (item) item.isAvailable = !item.isAvailable;
    },

    // Orders
    addOrder: {
      reducer(state, action) {
        state.orders.push(action.payload);
      },
      prepare(order) {
        return { payload: { id: nanoid(), status: 'pending', orderDate: new Date().toISOString(), ...order } };
      }
    },
  // assignOrderToPartner reducer removed in favor of server-backed thunk
    cancelOrder(state, action) {
      const { orderId, reason } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
        order.cancellationReason = reason || 'Cancelled by admin';
      }
    },

    // Delivery partners
    addPartner: {
      reducer(state, action) {
        state.partners.push(action.payload);
      },
      prepare(partner) {
        return { payload: { id: nanoid(), isOnline: false, isAvailable: true, rating: 5, totalDeliveries: 0, ...partner } };
      }
    },
    updatePartner(state, action) {
      const { id, changes } = action.payload;
      const idx = state.partners.findIndex(p => p.id === id);
      if (idx !== -1) state.partners[idx] = { ...state.partners[idx], ...changes };
    },
    deletePartner(state, action) {
      state.partners = state.partners.filter(p => p.id !== action.payload);
    },

    // Promotions & discounts
    addCoupon: {
      reducer(state, action) {
        state.coupons.push(action.payload);
      },
      prepare(coupon) {
        return { payload: { id: nanoid(), isActive: true, ...coupon } };
      }
    },

    // Payment & revenue
    addTransaction: {
      reducer(state, action) {
        state.transactions.push(action.payload);
      },
      prepare(tx) {
        return { payload: { id: nanoid(), createdAt: new Date().toISOString(), ...tx } };
      }
    },
    setCommissionRate(state, action) {
      const { restaurantId, ratePercent } = action.payload;
      if (restaurantId) {
        state.commissions.restaurantOverrides[restaurantId] = ratePercent;
      } else {
        state.commissions.defaultRatePercent = ratePercent;
      }
    },
  },
  extraReducers: (builder) => {
    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading.users = true;
        state.error.users = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading.users = false;
        state.users = action.payload.data || [];
        state.pagination.users = {
          page: action.payload.page || 0,
          size: action.payload.size || 10,
          total: action.payload.total || 0
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading.users = false;
        state.error.users = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload.data);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.data.id);
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload.data.id);
        if (user) {
          user.isActive = action.payload.data.isActive;
        }
      });

    // Restaurants
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading.restaurants = true;
        state.error.restaurants = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading.restaurants = false;
        state.restaurants = action.payload.data || [];
        state.pagination.restaurants = {
          page: action.payload.page || 0,
          size: action.payload.size || 10,
          total: action.payload.total || 0
        };
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading.restaurants = false;
        state.error.restaurants = action.payload;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        if (action.payload?.data) state.restaurants.unshift(action.payload.data);
      })
      .addCase(updateRestaurantProfile.fulfilled, (state, action) => {
        const idx = state.restaurants.findIndex(r => r.id === action.payload?.data?.id);
        if (idx !== -1) state.restaurants[idx] = action.payload.data;
      })
      .addCase(approveRestaurant.fulfilled, (state, action) => {
        const index = state.restaurants.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.restaurants[index] = action.payload.data;
        }
      })
      .addCase(rejectRestaurant.fulfilled, (state, action) => {
        const index = state.restaurants.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.restaurants[index] = action.payload.data;
        }
      })
      .addCase(updateRestaurantStatus.fulfilled, (state, action) => {
        const index = state.restaurants.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.restaurants[index] = action.payload.data;
        }
      });

    // Lightweight toggles
    builder
      .addCase(setRestaurantOpenAsync.fulfilled, (state, action) => {
        const index = state.restaurants.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) state.restaurants[index] = action.payload.data;
      })
      .addCase(setRestaurantActiveAsync.fulfilled, (state, action) => {
        const index = state.restaurants.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) state.restaurants[index] = action.payload.data;
      });

    // Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading.orders = true;
        state.error.orders = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload.data || [];
        state.pagination.orders = {
          page: action.payload.page || 0,
          size: action.payload.size || 10,
          total: action.payload.total || 0
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error.orders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.data.id);
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
      });

    // Delivery Partners
    builder
      .addCase(fetchDeliveryPartners.pending, (state) => {
        state.loading.partners = true;
        state.error.partners = null;
      })
      .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
        state.loading.partners = false;
        state.partners = action.payload.data || [];
      })
      .addCase(fetchDeliveryPartners.rejected, (state, action) => {
        state.loading.partners = false;
        state.error.partners = action.payload;
      })
      .addCase(fetchAllDeliveryPartners.pending, (state) => {
        state.loading.partners = true;
        state.error.partners = null;
      })
      .addCase(fetchAllDeliveryPartners.fulfilled, (state, action) => {
        state.loading.partners = false;
        state.partners = action.payload.data || [];
      })
      .addCase(fetchAllDeliveryPartners.rejected, (state, action) => {
        state.loading.partners = false;
        state.error.partners = action.payload;
      })
      .addCase(approveDeliveryPartner.fulfilled, (state, action) => {
        const index = state.partners.findIndex(p => p.userId === action.payload.data.userId);
        if (index !== -1) {
          state.partners[index] = action.payload.data;
        }
      })
      .addCase(rejectDeliveryPartner.fulfilled, (state, action) => {
        const index = state.partners.findIndex(p => p.userId === action.payload.data.userId);
        if (index !== -1) {
          state.partners[index] = action.payload.data;
        }
      });

    // Coupons
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading.coupons = true;
        state.error.coupons = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading.coupons = false;
        state.coupons = action.payload.data || [];
        state.pagination.coupons = {
          page: action.payload.page || 0,
          size: action.payload.size || 10,
          total: action.payload.total || 0
        };
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading.coupons = false;
        state.error.coupons = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.push(action.payload.data);
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(c => c.id === action.payload.data.id);
        if (index !== -1) {
          state.coupons[index] = action.payload.data;
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c.id !== action.meta.arg);
      });

    // Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.error.transactions = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactions = action.payload.data || [];
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error.transactions = action.payload;
      });

    // Analytics
    builder
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics[action.payload.type] = action.payload.data;
      });
  }
});

export const {
  activateUser, deactivateUser, resetUserPassword, addUser, deleteUser,
  addRestaurant, updateRestaurant, deleteRestaurant, setRestaurantActive, setRestaurantOpen,
  addMenuCategory, updateMenuCategory, deleteMenuCategory, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
  addOrder, cancelOrder,
  addPartner, updatePartner, deletePartner,
  addCoupon, addTransaction, setCommissionRate
} = adminSlice.actions;

// Export async thunks
export {
  fetchUsers, 
  createUser, 
  updateUser, 
  toggleUserStatus,
  fetchRestaurants, 
  fetchPendingRestaurants, 
  approveRestaurant, 
  rejectRestaurant, 
  updateRestaurantStatus,
  createRestaurant, 
  updateRestaurantProfile,
  fetchOrders, 
  updateOrderStatus,
  fetchDeliveryPartners, 
  fetchAllDeliveryPartners,
  approveDeliveryPartner, 
  rejectDeliveryPartner,
  fetchCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  fetchTransactions, 
  fetchAnalytics,
  assignOrderToPartner,
  setRestaurantOpenAsync,
  setRestaurantActiveAsync
};

export default adminSlice.reducer;


