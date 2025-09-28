import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  subtotal: 0,
  deliveryFee: 5.0, // Example fee
  taxRate: 0.1, // 10%
  tax: 0,
  total: 0,
  appliedCoupon: null,
  restaurantName: '',
};

const calculateTotals = (state) => {
  state.subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  state.tax = state.subtotal * state.taxRate;
  let discount = 0;
  if (state.appliedCoupon) {
    discount = (state.subtotal * state.appliedCoupon.discountValue) / 100;
  }
  state.total = state.subtotal + state.deliveryFee + state.tax - discount;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (state.items.length > 0 && state.restaurantName !== newItem.restaurantName) {
        // Here you could dispatch a notification to the user
        console.error("You can only order from one restaurant at a time.");
        return;
      }
      
      if (!existingItem) {
        state.items.push({ ...newItem, quantity: 1 });
        if(state.items.length === 1) {
          state.restaurantName = newItem.restaurantName;
        }
      } else {
        existingItem.quantity++;
      }
      calculateTotals(state);
    },
    updateQuantity(state, action) {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
      calculateTotals(state);
    },
    removeFromCart(state, action) {
      const { itemId } = action.payload;
      state.items = state.items.filter((i) => i.id !== itemId);
      if (state.items.length === 0) {
        state.restaurantName = '';
        state.appliedCoupon = null;
      }
      calculateTotals(state);
    },
    applyCoupon(state, action) {
      state.appliedCoupon = action.payload;
      calculateTotals(state);
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
      calculateTotals(state);
    },
    clearCart(state) {
      state.items = [];
      state.restaurantName = '';
      state.appliedCoupon = null;
      calculateTotals(state);
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;