import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clearCart } from './cartSlice';

// Mock API call
const createOrderAPI = (order) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...order, id: Date.now(), status: 'Order Placed' });
    }, 1000);
  });
};

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (order, { dispatch }) => {
    const response = await createOrderAPI(order);
    dispatch(clearCart());
    return response;
  }
);

// Mock API call to fetch orders
const fetchOrdersAPI = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you'd filter orders by userId from your DB
      resolve([]); // Returning empty for now, as createOrder adds to the state
    }, 500);
  });
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId) => {
    const response = await fetchOrdersAPI(userId);
    return response;
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // This assumes createOrder is the source of truth for new orders during a session.
        // If fetching from a DB, you would replace state.items.
        state.items = [...state.items, ...action.payload];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;