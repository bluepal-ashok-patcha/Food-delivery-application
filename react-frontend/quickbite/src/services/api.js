import axios from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('auth');
  },

  // Get current user info from token
  getCurrentUser: () => {
    const authData = localStorage.getItem('auth');
    return authData ? JSON.parse(authData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
};

// User API endpoints
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },

  // Create user profile
  createProfile: async (profileData) => {
    const response = await api.post('/api/users/profile', profileData);
    return response.data;
  },

  // Get user addresses
  getAddresses: async () => {
    const response = await api.get('/api/users/addresses');
    return response.data;
  },

  // Add user address
  addAddress: async (addressData) => {
    const response = await api.post('/api/users/addresses', addressData);
    return response.data;
  },

  // Update user address
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/api/users/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete user address
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/api/users/addresses/${addressId}`);
    return response.data;
  }
};

// Restaurant API endpoints
export const restaurantAPI = {
  // Get all restaurants
  getRestaurants: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.search) params.append('search', filters.search);
    if (filters.isOpen !== undefined) params.append('isOpen', filters.isOpen);
    
    const response = await api.get(`/api/restaurants?${params.toString()}`);
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    const response = await api.get(`/api/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant menu items
  getRestaurantItems: async (restaurantId) => {
    const response = await api.get(`/api/restaurants/${restaurantId}/items`);
    return response.data;
  },

  // Get restaurant reviews
  getRestaurantReviews: async (restaurantId) => {
    const response = await api.get(`/api/restaurants/${restaurantId}/reviews`);
    return response.data;
  },

  // Add restaurant review
  addReview: async (restaurantId, reviewData) => {
    const response = await api.post(`/api/restaurants/${restaurantId}/reviews`, reviewData);
    return response.data;
  }
};

// Cart API endpoints
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (itemData) => {
    const response = await api.post('/api/cart/add', itemData);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (menuItemId, quantity) => {
    const response = await api.put(`/api/cart/items/${menuItemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (menuItemId) => {
    const response = await api.delete(`/api/cart/items/${menuItemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/api/cart');
    return response.data;
  },

  // Apply coupon to cart
  applyCoupon: async (couponCode) => {
    const response = await api.post('/api/cart/coupon', { code: couponCode });
    return response.data;
  },

  // Remove coupon from cart
  removeCoupon: async () => {
    const response = await api.delete('/api/cart/coupon');
    return response.data;
  },

  // Get cart pricing
  getCartPricing: async () => {
    const response = await api.get('/api/cart/pricing');
    return response.data;
  }
};

// Order API endpoints
export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Create order from cart
  createOrderFromCart: async () => {
    const response = await api.post('/api/orders/from-cart');
    return response.data;
  },

  // Get user's orders
  getUserOrders: async () => {
    const response = await api.get('/api/orders/user');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/orders/user/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Payment API endpoints
export const paymentAPI = {
  // Process payment
  processPayment: async (paymentData) => {
    const response = await api.post('/api/payments/process', paymentData);
    return response.data;
  },

  // Create payment intent
  createPaymentIntent: async (amount, currency = 'INR') => {
    const response = await api.post('/api/payments/intent', { amount, currency });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get('/api/payments/history');
    return response.data;
  },

  // Get applicable coupons
  getApplicableCoupons: async () => {
    const response = await api.get('/api/payments/coupons/applicable');
    return response.data;
  },

  // Validate coupon
  validateCoupon: async (couponCode) => {
    const response = await api.post('/api/payments/coupons/validate', { code: couponCode });
    return response.data;
  }
};

export default api;
