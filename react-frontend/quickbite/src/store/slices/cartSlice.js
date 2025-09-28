import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  restaurantId: null,
  restaurantName: '',
  appliedCoupon: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, restaurantId, restaurantName } = action.payload;
      
      // If cart is empty or same restaurant, add item
      if (state.items.length === 0 || state.restaurantId === restaurantId) {
        const existingItem = state.items.find(cartItem => 
          cartItem.id === item.id && 
          JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
        );
        
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          state.items.push({
            ...item,
            quantity: item.quantity || 1
          });
        }
        
        state.restaurantId = restaurantId;
        state.restaurantName = restaurantName;
      } else {
        // Different restaurant - clear cart and add new item
        state.items = [{
          ...item,
          quantity: item.quantity || 1
        }];
        state.restaurantId = restaurantId;
        state.restaurantName = restaurantName;
        state.appliedCoupon = null;
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    updateQuantity: (state, action) => {
      const { itemId, customization, quantity } = action.payload;
      const item = state.items.find(cartItem => 
        cartItem.id === itemId && 
        JSON.stringify(cartItem.customization) === JSON.stringify(customization)
      );
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(cartItem => cartItem !== item);
        } else {
          item.quantity = quantity;
        }
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeFromCart: (state, action) => {
      const { itemId, customization } = action.payload;
      state.items = state.items.filter(cartItem => 
        !(cartItem.id === itemId && 
          JSON.stringify(cartItem.customization) === JSON.stringify(customization))
      );
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.tax = 0;
      state.total = 0;
      state.restaurantId = null;
      state.restaurantName = '';
      state.appliedCoupon = null;
    },
    
    applyCoupon: (state, action) => {
      const coupon = action.payload;
      state.appliedCoupon = coupon;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Calculate delivery fee (simplified logic)
      state.deliveryFee = state.subtotal > 0 ? 2.99 : 0;
      
      // Calculate tax (8% of subtotal)
      state.tax = state.subtotal * 0.08;
      
      // Apply coupon discount
      let discount = 0;
      if (state.appliedCoupon) {
        if (state.appliedCoupon.discountType === 'percentage') {
          discount = (state.subtotal * state.appliedCoupon.discountValue) / 100;
          if (state.appliedCoupon.maxDiscount) {
            discount = Math.min(discount, state.appliedCoupon.maxDiscount);
          }
        } else {
          discount = state.appliedCoupon.discountValue;
        }
      }
      
      state.total = state.subtotal + state.deliveryFee + state.tax - discount;
    }
  }
});

export const { 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  applyCoupon, 
  removeCoupon 
} = cartSlice.actions;

export default cartSlice.reducer;
