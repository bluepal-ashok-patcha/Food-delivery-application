import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
  isAuthModalOpen: false,
  isCartModalOpen: false,
  isLocationModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal(state) {
      state.isAuthModalOpen = true;
    },
    closeAuthModal(state) {
      state.isAuthModalOpen = false;
    },
    openCartModal(state) {
      state.isCartModalOpen = true;
    },
    closeCartModal(state) {
      state.isCartModalOpen = false;
    },
    openLocationModal(state) {
      state.isLocationModalOpen = true;
    },
    closeLocationModal(state) {
      state.isLocationModalOpen = false;
    },
    showNotification(state, action) {
      const { message, type = 'success' } = action.payload;
      toast[type](message);
    },
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  openCartModal,
  closeCartModal,
  openLocationModal,
  closeLocationModal,
  showNotification,
} = uiSlice.actions;

export default uiSlice.reducer;