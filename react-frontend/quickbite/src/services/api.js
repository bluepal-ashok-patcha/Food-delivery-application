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
    // Backend supports 'search' (matches name or cuisineType). Use cuisine as search.
    const searchValue = filters.search || filters.cuisine;
    if (searchValue) params.append('search', searchValue);
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size !== undefined) params.append('size', filters.size);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
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

  // Add item to cart (expects AddToCartRequest: { restaurantId, item: { menuItemId, quantity, customization } })
  addToCart: async ({ restaurantId, menuItemId, quantity, customization }) => {
    const body = { restaurantId, item: { menuItemId, quantity, customization } };
    const response = await api.post('/api/cart/add', body);
    return response.data;
  },

  // Update cart item quantity (supports customization to target line)
  updateCartItem: async (menuItemId, quantity, customization) => {
    const body = { menuItemId, quantity };
    if (customization !== undefined) body.customization = customization;
    const response = await api.put(`/api/cart/items/${menuItemId}`, body);
    return response.data;
  },

  // Remove item from cart (supports customization to target line)
  removeFromCart: async (menuItemId, customization) => {
    // Always send customization; backend matches strictly on string (use {} for none)
    const qs = `?customization=${encodeURIComponent(customization || '{}')}`;
    const response = await api.delete(`/api/cart/items/${menuItemId}${qs}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/api/cart');
    return response.data;
  },

  // Apply coupon to cart
  applyCoupon: async (couponCode) => {
    const params = new URLSearchParams();
    if (couponCode) params.append('couponCode', couponCode);
    const response = await api.post(`/api/cart/coupon?${params.toString()}`);
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
  createOrderFromCart: async (queryString) => {
    const qs = queryString ? `?${queryString}` : '';
    const response = await api.post(`/api/orders/from-cart${qs}`);
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
  createPaymentIntent: async (amount, currency = 'INR', orderId) => {
    const body = {};
    if (orderId !== undefined) body.orderId = orderId;
    if (amount !== undefined) body.amount = amount;
    body.currency = currency || 'INR';
    const response = await api.post('/api/payments/intent', body);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const response = await api.post('/api/payments/verify-payment', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
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

// Delivery API endpoints
export const deliveryAPI = {
  // Create delivery assignment
  createAssignment: async (orderId, extra = {}) => {
    const body = { orderId, ...extra };
    const response = await api.post('/api/delivery/assignments', body);
    return response.data;
  },

  // Get assignment by order id
  getAssignmentByOrder: async (orderId) => {
    const response = await api.get(`/api/delivery/assignments/order/${orderId}`);
    return response.data;
  }
};

export default api;
