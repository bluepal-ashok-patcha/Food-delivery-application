# QuickBite API Gateway - Complete Endpoint Mapping

This document provides a comprehensive overview of all API endpoints implemented in the API Gateway with their role-based access control.

## 🔐 **Authentication & Authorization**

### **Public Endpoints (No Authentication Required)**
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/{id}` - Get restaurant details
- `GET /api/restaurants/{restaurantId}/reviews` - Get restaurant reviews
- `GET /api/restaurants/{restaurantId}/categories` - Get restaurant categories
- `GET /api/restaurants/{restaurantId}/items` - Get restaurant menu items
- `GET /api/restaurants/items/{itemId}` - Get specific menu item
- `GET /api/delivery/partners/available` - Get available delivery partners
- `GET /api/delivery/partners/{partnerUserId}/reviews` - Get delivery partner reviews
- `POST /api/payments/webhook` - Payment webhook (Razorpay)
- `POST /api/payments/coupons/validate` - Validate coupon code

### **Authentication Endpoints**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

## 👤 **Customer Endpoints (JWT Role: CUSTOMER)**

### **Order Management**
- `POST /api/orders` - Create new order
- `POST /api/orders/from-cart` - Create order from cart
- `GET /api/orders/user` - Get user's orders
- `GET /api/orders/user/**` - Get user's order details

### **Cart Management**
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/{menuItemId}` - Update cart item quantity
- `DELETE /api/cart/items/{menuItemId}` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart
- `POST /api/cart/coupon` - Apply coupon to cart
- `DELETE /api/cart/coupon` - Remove coupon from cart
- `GET /api/cart/pricing` - Get cart pricing breakdown

### **User Profile Management**
- `POST /api/users/profile` - Create user profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/location` - Get user location
- `PUT /api/users/location` - Update user location
- `POST /api/users/addresses` - Add user address
- `PUT /api/users/addresses/{addressId}` - Update user address
- `DELETE /api/users/addresses/{addressId}` - Delete user address

### **Payment Management**
- `POST /api/payments/process` - Process payment
- `POST /api/payments/refund` - Request refund
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/coupons/applicable` - Get applicable coupons
- `POST /api/payments/intent` - Create payment intent

### **Reviews**
- `POST /api/restaurants/{restaurantId}/reviews` - Add restaurant review
- `POST /api/delivery/partners/{partnerUserId}/reviews` - Add delivery partner review

### **Transaction Management**
- `GET /api/payments/transactions` - Get user transactions
- `GET /api/payments/transactions/{id}` - Get specific transaction
- `GET /api/payments/transactions/order/{orderId}` - Get order transactions

## 🏪 **Restaurant Owner Endpoints (JWT Role: RESTAURANT_OWNER)**

### **Restaurant Management**
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/{id}/profile` - Update restaurant profile
- `GET /api/restaurants/my` - Get owner's restaurants

### **Menu Management**
- `POST /api/restaurants/{restaurantId}/categories` - Create category
- `POST /api/restaurants/categories` - Create category (alternative)
- `PUT /api/restaurants/categories/{categoryId}` - Update category
- `DELETE /api/restaurants/categories/{categoryId}` - Delete category
- `POST /api/restaurants/categories/{categoryId}/items` - Add item to category
- `POST /api/restaurants/items` - Create menu item
- `PUT /api/restaurants/items/{itemId}` - Update menu item
- `DELETE /api/restaurants/items/{itemId}` - Delete menu item

### **Order Management**
- `GET /api/restaurants/orders` - Get restaurant orders
- `GET /api/restaurants/orders` - Get restaurant orders
- `PUT /api/restaurants/orders/{orderId}/status` - Update order status
- `GET /api/orders/restaurant/{restaurantId}` - Get restaurant orders

### **Delivery Management**
- `POST /api/delivery/assignments` - Create delivery assignment
- `GET /api/delivery/assignments/order/{orderId}` - Get order delivery status

### **Transaction Management**
- `GET /api/payments/transactions/restaurant/{restaurantId}` - Get restaurant transactions

## 🚚 **Delivery Partner Endpoints (JWT Role: DELIVERY_PARTNER)**

### **Profile Management**
- `POST /api/delivery/partners` - Create delivery partner profile
- `GET /api/delivery/partners/profile` - Get delivery partner profile
- `PUT /api/delivery/partners/status` - Update delivery status
- `PUT /api/delivery/partners/location` - Update location

### **Assignment Management**
- `PUT /api/delivery/assignments/{assignmentId}/accept` - Accept delivery assignment
- `PUT /api/delivery/assignments/{assignmentId}/status` - Update assignment status
- `GET /api/delivery/assignments/my` - Get my assignments
- `GET /api/delivery/assignments/active` - Get active assignments
- `PUT /api/delivery/location` - Update current location
- `GET /api/delivery/assignments/order/{orderId}` - Get order assignment details

### **Order Management**
- `PUT /api/orders/{orderId}/status` - Update order status

## 👑 **Admin Endpoints (JWT Role: ADMIN)**

### **User Management**
- `GET /admin/users` - Get all users
- `POST /admin/users` - Create user (any role)
- `PUT /admin/users/{id}` - Update user
- `PUT /admin/users/{id}/activate` - Activate user
- `PUT /admin/users/{id}/deactivate` - Deactivate user
- `GET /api/users/admin/**` - Admin user operations
- `PUT /api/users/admin/**` - Admin user operations
- `DELETE /api/users/admin/**` - Admin user operations

### **Restaurant Management**
- `GET /api/restaurants/admin/pending` - Get pending restaurant approvals
- `GET /api/restaurants/admin/all` - Get all restaurants
- `PUT /api/restaurants/admin/{restaurantId}/approve` - Approve restaurant
- `PUT /api/restaurants/admin/{restaurantId}/reject` - Reject restaurant
- `PUT /api/restaurants/admin/{restaurantId}/status` - Update restaurant status
- `PUT /api/restaurants/{id}/status` - Update restaurant status
- `POST /api/restaurants` - Create restaurant (admin can create for any owner)

### **Order Management**
- `GET /api/orders` - Get all orders
- `GET /api/orders/admin` - Get admin order view
- `GET /api/orders/admin/**` - Admin order operations
- `PUT /api/orders/{orderId}/status` - Update order status
- `GET /api/orders/restaurant/{restaurantId}` - Get restaurant orders

### **Payment & Coupon Management**
- `POST /api/payments/coupons` - Create coupon
- `PUT /api/payments/coupons/{couponId}` - Update coupon
- `DELETE /api/payments/coupons/{couponId}` - Delete coupon
- `GET /api/payments/coupons` - Get all coupons
- `GET /api/payments/coupons/{couponId}` - Get specific coupon
- `GET /api/payments/transactions` - Get all transactions
- `GET /api/payments/transactions/{id}` - Get specific transaction
- `GET /api/payments/transactions/order/{orderId}` - Get order transactions
- `GET /api/payments/transactions/status/{status}` - Get transactions by status
- `GET /api/payments/transactions/restaurant/{restaurantId}` - Get restaurant transactions

### **Delivery Management**
- `POST /api/delivery/assignments` - Create delivery assignment
- `GET /api/delivery/admin/**` - Admin delivery operations
- `PUT /api/delivery/admin/**` - Admin delivery operations
- `GET /api/delivery/assignments/order/{orderId}` - Get order assignment details

## 🔄 **Multi-Role Endpoints**

### **Order Status Updates**
- `PUT /api/orders/{orderId}/status` - Update order status
  - **Allowed Roles**: RESTAURANT_OWNER, ADMIN, DELIVERY_PARTNER

### **Delivery Assignment Creation**
- `POST /api/delivery/assignments` - Create delivery assignment
  - **Allowed Roles**: RESTAURANT_OWNER, ADMIN

### **Assignment Lookup**
- `GET /api/delivery/assignments/order/{orderId}` - Get order assignment details
  - **Allowed Roles**: CUSTOMER, RESTAURANT_OWNER, ADMIN, DELIVERY_PARTNER

## 🛡️ **Security Features**

### **JWT Token Validation**
- All protected endpoints require valid JWT token
- Token contains: userId, role, email
- Token expiration: 10 hours
- Secret key: Environment variable `jwt.secret`

### **Role-Based Access Control**
- **CUSTOMER**: Order management, cart operations, profile management, payments, reviews
- **RESTAURANT_OWNER**: Restaurant management, menu operations, order status updates
- **DELIVERY_PARTNER**: Delivery assignments, status updates, location tracking
- **ADMIN**: System administration, user management, restaurant approvals, coupon management

### **API Gateway Routes**
- **Auth Service**: `/auth/**`, `/admin/**`
- **User Service**: `/api/users/**`
- **Order Service**: `/api/orders/**`, `/api/cart/**`
- **Restaurant Service**: `/api/restaurants/**`
- **Delivery Service**: `/api/delivery/**`
- **Payment Service**: `/api/payments/**`

## 📝 **Usage Notes**

1. **Authentication**: Include `Authorization: Bearer <token>` header for protected endpoints
2. **Role Validation**: Users must have appropriate roles for endpoint access
3. **Error Handling**: 401 for missing/invalid tokens, 403 for insufficient permissions
4. **Service Discovery**: All services registered with Eureka for load balancing
5. **Database**: All services connect to the same MySQL database
6. **Cart Service**: Cart endpoints are part of order-service (port 9003)

## 🔧 **Configuration**

### **Environment Variables**
```properties
# JWT Secret (should be different per environment)
jwt.secret=${JWT_SECRET}

# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/quickbite_db
DB_USERNAME=root
DB_PASSWORD=your_password

# Email Configuration (for notifications)
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### **Service Ports**
- **API Gateway**: 8080
- **Discovery Service**: 8761
- **Auth Service**: 9001
- **User Service**: 9002
- **Order Service**: 9003
- **Restaurant Service**: 9004
- **Delivery Service**: 9005
- **Payment Service**: 9006

This comprehensive endpoint mapping ensures proper role-based access control across all QuickBite services while maintaining security and scalability.
