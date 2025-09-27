import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import restaurantReducer from './slices/restaurantSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    restaurants: restaurantReducer,
    ui: uiReducer,
  },
});