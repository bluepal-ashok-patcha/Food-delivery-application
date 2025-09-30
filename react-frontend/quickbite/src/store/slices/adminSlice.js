import { createSlice, nanoid } from '@reduxjs/toolkit';
import { mockUsers, mockRestaurants, mockOrders, mockDeliveryPartners, mockCoupons } from '../../constants/mockData';

const initialState = {
  users: mockUsers,
  restaurants: mockRestaurants.map(r => ({ ...r, isApproved: true })),
  orders: mockOrders,
  partners: mockDeliveryPartners,
  coupons: mockCoupons,
  transactions: [],
  commissions: {
    defaultRatePercent: 10,
    restaurantOverrides: {}
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Users
    activateUser(state, action) {
      const user = state.users.find(u => u.id === action.payload);
      if (user) user.isActive = true;
    },
    approveRestaurant(state, action) {
      const r = state.restaurants.find(x => x.id === action.payload);
      if (r) r.isApproved = true;
    },
    rejectRestaurant(state, action) {
      const r = state.restaurants.find(x => x.id === action.payload);
      if (r) {
        r.isApproved = false;
        r.isActive = false;
        r.isOpen = false;
      }
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
    updateUser(state, action) {
      const { id, changes } = action.payload;
      const idx = state.users.findIndex(u => u.id === id);
      if (idx !== -1) state.users[idx] = { ...state.users[idx], ...changes };
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
    updateOrderStatus(state, action) {
      const { id, status } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (order) order.status = status;
    },
    assignOrderToPartner(state, action) {
      const { orderId, partnerId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) order.deliveryPartnerId = partnerId;
    },
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
    updateCoupon(state, action) {
      const { id, changes } = action.payload;
      const idx = state.coupons.findIndex(c => c.id === id);
      if (idx !== -1) state.coupons[idx] = { ...state.coupons[idx], ...changes };
    },
    deleteCoupon(state, action) {
      state.coupons = state.coupons.filter(c => c.id !== action.payload);
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
  }
});

export const {
  activateUser, deactivateUser, resetUserPassword, addUser, updateUser, deleteUser,
  addRestaurant, updateRestaurant, deleteRestaurant, setRestaurantActive, setRestaurantOpen,
  addMenuCategory, updateMenuCategory, deleteMenuCategory, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
  addOrder, updateOrderStatus, assignOrderToPartner, cancelOrder,
  addPartner, updatePartner, deletePartner,
  addCoupon, updateCoupon, deleteCoupon,
  addTransaction, setCommissionRate,
  approveRestaurant, rejectRestaurant
} = adminSlice.actions;

export default adminSlice.reducer;


