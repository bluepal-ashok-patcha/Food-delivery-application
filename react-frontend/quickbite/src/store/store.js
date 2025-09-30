import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import restaurantSlice from './slices/restaurantSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';
import uiSlice from './slices/uiSlice';
import locationSlice from './slices/locationSlice';
import reviewsSlice from './slices/reviewsSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    restaurants: restaurantSlice,
    cart: cartSlice,
    orders: orderSlice,
    ui: uiSlice,
    location: locationSlice,
    reviews: reviewsSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// TypeScript types (commented out for JavaScript project)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
