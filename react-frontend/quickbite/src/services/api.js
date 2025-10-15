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

  // Update user current location (lat/lng)
  updateLocation: async (latitude, longitude) => {
    const response = await api.put('/api/users/location', {
      currentLatitude: latitude,
      currentLongitude: longitude
    });
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
    const payload = {
      isDefault: false,
      ...addressData
    };
    const response = await api.post('/api/users/addresses', payload);
    return response.data;
  },

  // Update user address
  updateAddress: async (addressId, addressData) => {
    const payload = {
      // Backend requires non-null isDefault
      isDefault: addressData?.isDefault ?? false,
      ...addressData
    };
    const response = await api.put(`/api/users/addresses/${addressId}`, payload);
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
    if (filters.isPureVeg !== undefined) params.append('isPureVeg', filters.isPureVeg);
    
    // Location-based filtering
    if (filters.latitude !== undefined) params.append('latitude', filters.latitude);
    if (filters.longitude !== undefined) params.append('longitude', filters.longitude);
    if (filters.radiusKm !== undefined) params.append('radiusKm', filters.radiusKm);
    
    const response = await api.get(`/api/restaurants?${params.toString()}`);
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    const response = await api.get(`/api/restaurants/${id}`);
    return response.data;
  },

  // Get analytics for a restaurant
  getRestaurantAnalytics: async (restaurantId, period = 'week') => {
    const response = await api.get(`/api/restaurants/${restaurantId}/analytics?period=${period}`);
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
  },

  // Add delivery partner review
  addDeliveryPartnerReview: async (partnerUserId, reviewData) => {
    const response = await api.post(`/api/delivery/partners/${partnerUserId}/reviews`, reviewData);
    return response.data;
  },

  // Get delivery partner reviews
  getDeliveryPartnerReviews: async (partnerUserId) => {
    const response = await api.get(`/api/delivery/partners/${partnerUserId}/reviews`);
    return response.data;
  },

  // Restaurant owner application
  applyAsRestaurantOwner: async (applicationData) => {
    const response = await api.post('/api/restaurants/owners/apply', applicationData);
    return response.data;
  },

  // Get my restaurants (for restaurant owners)
  getMyRestaurants: async () => {
    const response = await api.get('/api/restaurants/my');
    return response.data;
  },

  // Update restaurant profile
  updateRestaurantProfile: async (restaurantId, restaurantData) => {
    const response = await api.put(`/api/restaurants/${restaurantId}/profile`, restaurantData);
    return response.data;
  },

  // Toggle restaurant open/closed status
  setRestaurantOpen: async (restaurantId, isOpen) => {
    const response = await api.put(`/api/restaurants/${restaurantId}/open?isOpen=${isOpen}`);
    return response.data;
  },

  // Menu management
  getRestaurantCategories: async (restaurantId) => {
    const response = await api.get(`/api/restaurants/${restaurantId}/categories`);
    return response.data;
  },

  addMenuCategory: async (restaurantId, categoryData) => {
    const response = await api.post(`/api/restaurants/${restaurantId}/categories`, categoryData);
    return response.data;
  },

  updateMenuCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/api/restaurants/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteMenuCategory: async (categoryId) => {
    const response = await api.delete(`/api/restaurants/categories/${categoryId}`);
    return response.data;
  },

  addMenuItem: async (categoryId, itemData) => {
    const response = await api.post(`/api/restaurants/categories/${categoryId}/items`, itemData);
    return response.data;
  },

  updateMenuItem: async (itemId, itemData) => {
    const response = await api.put(`/api/restaurants/items/${itemId}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (itemId) => {
    const response = await api.delete(`/api/restaurants/items/${itemId}`);
    return response.data;
  },

  getMenuItemById: async (itemId) => {
    const response = await api.get(`/api/restaurants/items/${itemId}`);
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
  getUserOrders: async (sortBy = 'createdAt', sortDir = 'desc') => {
    const response = await api.get(`/api/orders/user?sortBy=${sortBy}&sortDir=${sortDir}`);
    return response.data;
  },

  // Get latest active order for current user
  getActiveOrder: async () => {
    const response = await api.get('/api/orders/user/active');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/orders/user/${orderId}`);
    return response.data;
  },

  // Get order review status
  getOrderReviewStatus: async (orderId) => {
    const response = await api.get(`/api/orders/user/${orderId}/review-status`);
    // Normalize to return the inner payload { restaurantReviewed, deliveryReviewed }
    return response.data?.data ?? response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/api/orders/${orderId}/status?status=${status}`);
    return response.data;
  },

  // Get orders for a specific restaurant
  getRestaurantOrders: async (restaurantId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size !== undefined) params.append('size', filters.size);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/api/orders/restaurant/${restaurantId}?${params.toString()}`);
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
  createAssignment: async (orderId) => {
    const body = { orderId };
    const response = await api.post('/api/delivery/assignments', body);
    return response.data;
  },

  // Claim order (create+accept assignment in one call)
  claimOrder: async (orderId) => {
    const response = await api.post(`/api/delivery/assignments/claim/${orderId}`);
    return response.data;
  },

  // Get assignment by order id
  getAssignmentByOrder: async (orderId) => {
    const response = await api.get(`/api/delivery/assignments/order/${orderId}`);
    return response.data;
  },

  // List available orders to claim
  getAvailableOrders: async () => {
    const response = await api.get('/api/delivery/assignments/available');
    return response.data;
  },

  // Accept an assignment (partner action)
  acceptAssignment: async (assignmentId) => {
    const response = await api.put(`/api/delivery/assignments/${assignmentId}/accept`);
    return response.data;
  },

  // Update delivery status (enum string e.g., PICKED_UP)
  updateDeliveryStatus: async (assignmentId, status) => {
    const response = await api.put(`/api/delivery/assignments/${assignmentId}/status?status=${status}`);
    return response.data;
  },

  // Get assignments for current partner
  getMyAssignments: async () => {
    const response = await api.get('/api/delivery/assignments/my');
    return response.data;
  },

  // Get active assignments for current partner
  getActiveAssignments: async () => {
    const response = await api.get('/api/delivery/assignments/active');
    return response.data;
  },

  // Get order items for a specific order
  getOrderItems: async (orderId) => {
    const response = await api.get(`/api/delivery/assignments/order/${orderId}/items`);
    return response.data;
  },

  // Update current partner GPS location
  updateLocation: async (latitude, longitude) => {
    const response = await api.put('/api/delivery/assignments/location', {
      latitude,
      longitude
    });
    return response.data;
  },

  // Delivery partner self-registration
  selfRegisterAsDeliveryPartner: async (registrationData) => {
    const response = await api.post('/api/delivery/partners/self-register', registrationData);
    return response.data;
  },

  // Admin edit partner profile using same endpoint; backend will use DTO.userId for ADMIN
  updatePartnerProfileAsAdmin: async (partnerUserId, profileData) => {
    const body = { ...profileData, userId: partnerUserId };
    const response = await api.put('/api/delivery/partners/profile', body);
    return response.data;
  },

  // Get delivery partner profile
  getProfile: async () => {
    const response = await api.get('/api/delivery/partners/profile');
    return response.data;
  },

  // Update delivery partner status
  updateStatus: async (status) => {
    const response = await api.put(`/api/delivery/partners/status?status=${status}`);
    return response.data;
  },

  // Update delivery partner location
  updatePartnerLocation: async (latitude, longitude) => {
    const response = await api.put('/api/delivery/partners/location', {
      latitude,
      longitude
    });
    return response.data;
  },

  // Get delivery analytics
  getAnalytics: async (period = 'week') => {
    const response = await api.get(`/api/delivery/analytics?period=${period}`);
    return response.data;
  },

  // Get analytics summary
  getAnalyticsSummary: async (period = 'week') => {
    const response = await api.get(`/api/delivery/analytics/summary?period=${period}`);
    return response.data;
  },

  // Update delivery partner profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/delivery/partners/profile', profileData);
    return response.data;
  }
};

// Admin API endpoints
export const adminAPI = {
  // User Management
  getAllUsers: async (page = 0, size = 10) => {
    const response = await api.get(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  createUser: async (userData, role = 'CUSTOMER') => {
    const response = await api.post(`/admin/users?role=${role}`, userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  importUsers: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  exportUsersToPdf: async () => {
    const response = await api.get('/admin/users/export/pdf', { responseType: 'blob' });
    return response.data;
  },

  exportUsersByRole: async (role) => {
    const response = await api.get(`/admin/users/export/pdf/${role}`, { responseType: 'blob' });
    return response.data;
  },

   // Export all users to Excel (grouped by role)
  exportUsersToExcel: async () => {
    const response = await api.get('/admin/users/export/excel', { responseType: 'blob' });
    return response.data;
  },

  // Export users by specific role to Excel
  exportUsersByRoleToExcel: async (role) => {
    const response = await api.get(`/admin/users/export/excel/${role}`, { responseType: 'blob' });
    return response.data;
  },

  downloadUserTemplate: async () => {
  const response = await api.get('/admin/users/template', { responseType: 'blob' });
  return response.data;
},

  // Restaurant Management
  getPendingRestaurants: async (page = 0, size = 10) => {
    const response = await api.get(`/api/restaurants/admin/pending?page=${page}&size=${size}`);
    return response.data;
  },
  createRestaurant: async (restaurantData) => {
    const response = await api.post('/api/restaurants', restaurantData);
    return response.data;
  },
  updateRestaurantProfile: async (restaurantId, restaurantData) => {
    const response = await api.put(`/api/restaurants/${restaurantId}/profile`, restaurantData);
    return response.data;
  },

  getAllRestaurants: async (page = 0, size = 10, status = null) => {
    const params = new URLSearchParams({ page, size });
    if (status) params.append('status', status);
    const response = await api.get(`/api/restaurants/admin/all?${params}`);
    return response.data;
  },

  approveRestaurant: async (restaurantId, approvalData) => {
    const response = await api.put(`/api/restaurants/admin/${restaurantId}/approve`, approvalData);
    return response.data;
  },

  rejectRestaurant: async (restaurantId, rejectionData) => {
    const response = await api.put(`/api/restaurants/admin/${restaurantId}/reject`, rejectionData);
    return response.data;
  },

  updateRestaurantStatus: async (restaurantId, status) => {
    const response = await api.put(`/api/restaurants/admin/${restaurantId}/status?status=${status}`);
    return response.data;
  },


  // Restaurant import/export
  exportRestaurantsAll: async (format = 'excel') => {
    const response = await api.get(`/api/restaurants/export/all?format=${encodeURIComponent(format)}`, { responseType: 'blob' });
    return response.data;
  },

  exportRestaurantsByOwner: async (ownerId, format = 'excel') => {
    const qs = [];
    if (ownerId !== undefined && ownerId !== null) qs.push(`ownerId=${encodeURIComponent(ownerId)}`);
    if (format) qs.push(`format=${encodeURIComponent(format)}`);
    const query = qs.length ? `?${qs.join('&')}` : '';
    const response = await api.get(`/api/restaurants/export${query}`, { responseType: 'blob' });
    return response.data;
  },

  importRestaurants: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/restaurants/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadRestaurantTemplate: async () => {
    const response = await api.get('/api/restaurants/import/template', { responseType: 'blob' });
    return response.data;
  },

  // New lightweight toggles
  setRestaurantOpen: async (restaurantId, isOpen) => {
    // Use owner route (admin is also allowed by gateway role map)
    const response = await api.put(`/api/restaurants/${restaurantId}/open?isOpen=${isOpen}`);
    return response.data;
  },

  setRestaurantActive: async (restaurantId, isActive) => {
    const response = await api.put(`/api/restaurants/admin/${restaurantId}/active?isActive=${isActive}`);
    return response.data;
  },

  initializeRestaurantRatings: async () => {
    const response = await api.post('/api/restaurants/admin/initialize-ratings');
    return response.data;
  },

  // Order Management
  getAllOrders: async (page = 0, size = 10) => {
    const response = await api.get(`/api/orders?page=${page}&size=${size}`);
    return response.data;
  },

  getAdminOrders: async (page = 0, size = 10) => {
    const response = await api.get(`/api/orders/admin?page=${page}&size=${size}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/api/orders/${orderId}/status?status=${status}`);
    return response.data;
  },

  getRestaurantOrders: async (restaurantId) => {
    const response = await api.get(`/api/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  // Delivery Partner Management
  getPendingPartners: async () => {
    const response = await api.get('/api/delivery/admin/pending');
    return response.data;
  },
  getAvailablePartners: async () => {
    const response = await api.get('/api/delivery/partners/available');
    return response.data;
  },
  getOfflinePartners: async () => {
    const response = await api.get('/api/delivery/admin/offline');
    return response.data;
  },

  approveDeliveryPartner: async (partnerUserId) => {
    const response = await api.put(`/api/delivery/admin/${partnerUserId}/approve`);
    return response.data;
  },

  rejectDeliveryPartner: async (partnerUserId) => {
    const response = await api.put(`/api/delivery/admin/${partnerUserId}/reject`);
    return response.data;
  },

  // Coupon Management
  getAllCoupons: async (page = 0, size = 10) => {
    const response = await api.get(`/api/payments/coupons?page=${page}&size=${size}`);
    return response.data;
  },

  getCouponById: async (couponId) => {
    const response = await api.get(`/api/payments/coupons/${couponId}`);
    return response.data;
  },

  createCoupon: async (couponData) => {
    console.log('Creating coupon with data:', couponData);
    const response = await api.post('/api/payments/coupons', couponData);
    console.log('Coupon creation response:', response.data);
    return response.data;
  },

  updateCoupon: async (couponId, couponData) => {
    const response = await api.put(`/api/payments/coupons/${couponId}`, couponData);
    return response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/api/payments/coupons/${couponId}`);
    return response.data;
  },

  // Transaction Management
  getAllTransactions: async () => {
    const response = await api.get('/api/payments/transactions');
    return response.data;
  },

  getTransactionById: async (id) => {
    const response = await api.get(`/api/payments/transactions/${id}`);
    return response.data;
  },

  getTransactionsByOrder: async (orderId) => {
    const response = await api.get(`/api/payments/transactions/order/${orderId}`);
    return response.data;
  },

  getTransactionsByStatus: async (status) => {
    const response = await api.get(`/api/payments/transactions/status/${status}`);
    return response.data;
  },

  getTransactionsByRestaurant: async (restaurantId) => {
    const response = await api.get(`/api/payments/transactions/restaurant/${restaurantId}`);
    return response.data;
  },

  // Analytics
  getRestaurantAnalytics: async (restaurantId, period = 'week') => {
    const response = await api.get(`/api/restaurants/${restaurantId}/analytics?period=${period}`);
    return response.data;
  },

  getRestaurantAnalyticsSummary: async (period = 'week') => {
    const response = await api.get(`/api/restaurants/analytics/summary?period=${period}`);
    return response.data;
  },

  getOrderAnalytics: async (period = 'week') => {
    const response = await api.get(`/api/orders/analytics?period=${period}`);
    return response.data;
  },

  getOrderAnalyticsSummary: async (period = 'week') => {
    const response = await api.get(`/api/orders/analytics/summary?period=${period}`);
    return response.data;
  },

  getDeliveryAnalytics: async (period = 'week') => {
    const response = await api.get(`/api/delivery/analytics?period=${period}`);
    return response.data;
  },

  getDeliveryAnalyticsSummary: async (period = 'week') => {
    const response = await api.get(`/api/delivery/analytics/summary?period=${period}`);
    return response.data;
  },

  getPaymentAnalytics: async (period = 'week') => {
    const response = await api.get(`/api/payments/analytics?period=${period}`);
    return response.data;
  },

  getPaymentAnalyticsSummary: async (period = 'week') => {
    const response = await api.get(`/api/payments/analytics/summary?period=${period}`);
    return response.data;
  }
};

export default api;
