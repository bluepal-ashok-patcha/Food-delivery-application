import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLocation: {
    address: '123 Main St, Anytown, USA',
    lat: null,
    lng: null,
  },
  savedAddresses: [
    { id: 1, type: 'Home', address: '123 Main St, Anytown, USA' },
    { id: 2, type: 'Work', address: '456 Business Ave, Corp City, USA' },
  ],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocationStart(state) {
      state.loading = true;
      state.error = null;
    },
    setLocationSuccess(state, action) {
      state.loading = false;
      state.currentLocation = action.payload;
    },
    setLocationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addAddress(state, action) {
      state.savedAddresses.push({ id: Date.now(), ...action.payload });
    },
    updateAddress(state, action) {
      const index = state.savedAddresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.savedAddresses[index] = action.payload;
      }
    },
    deleteAddress(state, action) {
      state.savedAddresses = state.savedAddresses.filter(addr => addr.id !== action.payload.id);
    },
  },
});

export const {
  setLocationStart,
  setLocationSuccess,
  setLocationFailure,
  addAddress,
  updateAddress,
  deleteAddress,
} = locationSlice.actions;

export default locationSlice.reducer;