import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isCartModalOpen: false,
  isAddressModalOpen: false,
  isPaymentModalOpen: false,
  
  // Loading states
  isPageLoading: false,
  
  // Notification states
  notification: {
    open: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  },
  
  // Location state
  currentLocation: null,
  selectedAddress: null,
  
  // Theme state
  theme: 'light',
  
  // Sidebar state
  isSidebarOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
    },
    closeRegisterModal: (state) => {
      state.isRegisterModalOpen = false;
    },
    openCartModal: (state) => {
      state.isCartModalOpen = true;
    },
    closeCartModal: (state) => {
      state.isCartModalOpen = false;
    },
    openAddressModal: (state) => {
      state.isAddressModalOpen = true;
    },
    closeAddressModal: (state) => {
      state.isAddressModalOpen = false;
    },
    openPaymentModal: (state) => {
      state.isPaymentModalOpen = true;
    },
    closePaymentModal: (state) => {
      state.isPaymentModalOpen = false;
    },
    
    // Loading actions
    setPageLoading: (state, action) => {
      state.isPageLoading = action.payload;
    },
    
    // Notification actions
    showNotification: (state, action) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        type: action.payload.type || 'info'
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
    
    // Location actions
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
    
    // Theme actions
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    }
  }
});

export const {
  // Modal actions
  openLoginModal,
  closeLoginModal,
  openRegisterModal,
  closeRegisterModal,
  openCartModal,
  closeCartModal,
  openAddressModal,
  closeAddressModal,
  openPaymentModal,
  closePaymentModal,
  
  // Loading actions
  setPageLoading,
  
  // Notification actions
  showNotification,
  hideNotification,
  
  // Location actions
  setCurrentLocation,
  setSelectedAddress,
  
  // Theme actions
  toggleTheme,
  setTheme,
  
  // Sidebar actions
  toggleSidebar,
  setSidebarOpen
} = uiSlice.actions;

export default uiSlice.reducer;
