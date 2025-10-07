import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI, paymentAPI, orderAPI } from '../../services/api';

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  restaurantId: null,
  restaurantName: '',
  appliedCoupon: null,
  appliedCouponCode: null
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to fetch cart');
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ restaurantId, menuItemId, quantity = 1, customization = {} }, { rejectWithValue }) => {
    try {
      // Normalize customization for backend strict match: send "{}" when empty, else JSON string
      let customizationStr;
      if (customization === null || customization === undefined) {
        customizationStr = '{}';
      } else if (typeof customization === 'string') {
        const trimmed = customization.trim();
        customizationStr = (trimmed === '' || trimmed === 'null') ? '{}' : trimmed;
      } else if (typeof customization === 'object') {
        customizationStr = Object.keys(customization).length === 0 ? '{}' : JSON.stringify(customization);
      } else {
        customizationStr = '{}';
      }
      const response = await cartAPI.addToCart({ restaurantId, menuItemId, quantity, customization: customizationStr });
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to add to cart');
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItemAsync',
  async ({ menuItemId, quantity, customization }, { rejectWithValue }) => {
    try {
      // Always include customization: send "{}" when empty, else JSON string
      let customizationStr = '{}';
      if (customization !== undefined) {
        if (customization === null) customizationStr = '{}';
        else if (typeof customization === 'string') {
          const trimmed = customization.trim();
          customizationStr = (trimmed === '' || trimmed === 'null') ? '{}' : trimmed;
        } else if (typeof customization === 'object') {
          customizationStr = Object.keys(customization).length === 0 ? '{}' : JSON.stringify(customization);
        }
      }
      const response = await cartAPI.updateCartItem(menuItemId, quantity, customizationStr);
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to update item');
    }
  }
);

export const removeCartItemAsync = createAsyncThunk(
  'cart/removeCartItemAsync',
  async ({ menuItemId, customization }, { rejectWithValue }) => {
    try {
      // Always include customization in delete: send "{}" when empty
      let customizationStr = '{}';
      if (customization !== undefined) {
        if (customization === null) customizationStr = '{}';
        else if (typeof customization === 'string') {
          const trimmed = customization.trim();
          customizationStr = (trimmed === '' || trimmed === 'null') ? '{}' : trimmed;
        } else if (typeof customization === 'object') {
          customizationStr = Object.keys(customization).length === 0 ? '{}' : JSON.stringify(customization);
        }
      }
      const response = await cartAPI.removeFromCart(menuItemId, customizationStr);
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to remove item');
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.clearCart();
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to clear cart');
    }
  }
);

export const applyCouponAsync = createAsyncThunk(
  'cart/applyCouponAsync',
  async ({ code }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.applyCoupon(code);
      const data = response.data || response;
      return data;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to apply coupon';
      return rejectWithValue(msg);
    }
  }
);

export const removeCouponAsync = createAsyncThunk(
  'cart/removeCouponAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeCoupon();
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to remove coupon');
    }
  }
);

export const fetchCartPricing = createAsyncThunk(
  'cart/fetchCartPricing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCartPricing();
      const data = response.data || response;
      return data;
    } catch (e) {
      return rejectWithValue('Failed to get pricing');
    }
  }
);

// Optional: payment then order-from-cart flow
export const checkoutAndPlaceOrder = createAsyncThunk(
  'cart/checkoutAndPlaceOrder',
  async ({ paymentMethod = 'card', addressId, specialInstructions }, { rejectWithValue }) => {
    try {
      // Create order from cart (backend requires addressId)
      const params = new URLSearchParams();
      if (addressId !== undefined) params.append('addressId', addressId);
      if (specialInstructions) params.append('specialInstructions', specialInstructions);
      const orderResp = await orderAPI.createOrderFromCart(params.toString());
      const order = orderResp.data || orderResp;

      return order;
    } catch (e) {
      return rejectWithValue('Checkout failed');
    }
  }
);

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
  },
  extraReducers: (builder) => {
    const syncFromBackend = (state, payload) => {
      // Expect backend payload with items, totals, restaurant info, coupon
      const cart = payload.cart || payload;
      state.items = (cart.items || []).map(it => ({
        id: it.menuItemId || it.id,
        name: it.name,
        price: it.price,
        image: it.imageUrl || it.image,
        // Preserve exact customization string/null from backend for matching
        customization: Object.prototype.hasOwnProperty.call(it, 'customization') ? it.customization : null,
        quantity: it.quantity || 1
      }));
      state.totalItems = state.items.reduce((a, b) => a + (b.quantity || 0), 0);
      state.subtotal = cart.subtotal || 0;
      state.deliveryFee = cart.deliveryFee || 0;
      state.tax = cart.tax || 0;
      state.total = cart.total || 0;
      state.restaurantId = cart.restaurantId || state.restaurantId;
      state.restaurantName = cart.restaurantName || state.restaurantName;
      state.appliedCoupon = cart.coupon || cart.appliedCoupon || state.appliedCoupon;
      state.appliedCouponCode = cart.appliedCouponCode || null;
    };

    builder
      .addCase(fetchCart.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(addToCartAsync.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(clearCartAsync.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(applyCouponAsync.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(removeCouponAsync.fulfilled, (state, action) => { syncFromBackend(state, action.payload); })
      .addCase(fetchCartPricing.fulfilled, (state, action) => {
        const pricing = action.payload.pricing || action.payload;
        state.subtotal = pricing.subtotal ?? state.subtotal;
        state.deliveryFee = pricing.deliveryFee ?? state.deliveryFee;
        state.tax = pricing.tax ?? state.tax;
        state.total = pricing.total ?? state.total;
      })
      .addCase(checkoutAndPlaceOrder.fulfilled, (state) => {
        // After successful order, clear local cart
        cartSlice.caseReducers.clearCart(state);
      });
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
