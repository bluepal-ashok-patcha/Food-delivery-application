# QuickBite Postman Testing Guide

This guide walks you through testing all QuickBite backend APIs via Postman through the API Gateway (`http://localhost:8080`). Ensure Eureka, API Gateway, and all services are running, and your database credentials are configured.

## Prerequisites
- Java 17, Maven, MySQL running
- Services running: discovery-service, api-gateway, auth-service, user-service, restaurant-service, delivery-service, order-service, payment-service
- Gateway base URL: `http://localhost:8080`
- JWT is required for protected routes. Obtain via login.

## 1) Authentication (auth-service)

### Register (Customer by default)
POST /auth/register
Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-111-2222",
  "password": "password123"
}
Response: { token, user }

### Login
POST /auth/login
Body:
{
  "email": "john@example.com",
  "password": "password123"
}
Response: { token, user }

Use the token as Authorization: Bearer <token> for subsequent requests.

### Admin User Management (ADMIN only)
- GET /admin/users
- POST /admin/users?role=ADMIN|CUSTOMER|RESTAURANT_OWNER|DELIVERY_PARTNER
  Body: { name, email, phone, password }
- PUT /admin/users/{id}
  Body: { name?, email?, phone?, role?, active? }
- PUT /admin/users/{id}/activate
- PUT /admin/users/{id}/deactivate

## 2) User Profiles & Addresses (user-service)

JWT required (any authenticated user).

- POST /api/users/profile
  Body: { userId, firstName, lastName, phoneNumber, addresses: [{ street, city, state, zipCode, type }] }
- GET /api/users/profile?userId={userId}
- PUT /api/users/profile
  Body: same as create (updates)

## 3) Restaurants (restaurant-service)

Public:
- GET /api/restaurants?page=0&size=10&sortBy=name&sortDir=asc&search=pizza
- GET /api/restaurants/{id}

Restaurant Owner (JWT role: RESTAURANT_OWNER) or Admin (JWT role: ADMIN):
- POST /api/restaurants
  Body:
  {
    "name": "Pasta Palace",
    "address": "22 Baker St, Boston",
    "contactNumber": "+1 555-777-8888",
    "cuisineType": "Italian",
    "openingTime": "09:00:00",
    "closingTime": "22:30:00",
    "description": "Authentic Italian cuisine",
    "image": "https://.../image.jpg",
    "coverImage": "https://.../cover.jpg",
    "rating": 4.5,
    "totalRatings": 1250,
    "deliveryTime": "25-30 mins",
    "deliveryFee": 2.99,
    "minimumOrder": 15.0,
    "isOpen": true,
    "isActive": true,
    "isVeg": false,
    "isPureVeg": false,
    "openingHours": "10:00 AM - 11:00 PM",
    "deliveryRadiusKm": 5,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "tags": "Popular,Fast Delivery,Best Seller",
    "ownerId": 3
  }
  Note: `ownerId` is required only when caller is ADMIN; owners will have it set from JWT automatically.
- PUT /api/restaurants/{id}/profile
  Body: same as create (owner cannot change ownerId/status)
- POST /api/restaurants/{restaurantId}/categories
  Body: { name }
- POST /api/restaurants/categories/{categoryId}/items
  Body:
  {
    "name": "Garlic Bread",
    "description": "Fresh baked with herbs",
    "price": 3.99,
    "imageUrl": "https://.../gb.jpg",
    "inStock": true,
    "originalPrice": 4.99,
    "isVeg": true,
    "isPopular": true,
    "preparationTime": 10,
    "customizationJson": "[{\"name\":\"Cheese\",\"options\":[\"Extra\",\"Regular\"]}]",
    "nutritionJson": "{\"calories\":220,\"protein\":6,\"carbs\":30,\"fat\":8}"
  }
- PUT /api/restaurants/categories/{categoryId}
  Body: { name }
- PUT /api/restaurants/items/{itemId}
  Body: { name?, description?, price?, available? }
- DELETE /api/restaurants/categories/{categoryId}
- DELETE /api/restaurants/items/{itemId}

Admin (JWT role: ADMIN):
- GET /api/restaurants/admin/pending?page=0&size=10
- GET /api/restaurants/admin/all?page=0&size=10&status=PENDING_APPROVAL|APPROVED|REJECTED
- PUT /api/restaurants/admin/{restaurantId}/approve
  Body: 
  {
    "approvalNotes": "Restaurant meets all quality standards. Approved for operation."
  }
- PUT /api/restaurants/admin/{restaurantId}/reject
  Body: 
  {
    "rejectionReason": "Missing required food safety certifications. Please resubmit with proper documentation."
  }
- PUT /api/restaurants/admin/{restaurantId}/status?status=PENDING_APPROVAL|APPROVED|REJECTED|ACTIVE|INACTIVE

Reviews:
- POST /api/restaurants/{restaurantId}/reviews (JWT required)
  Body: { rating: 1-5, comment }
- GET /api/restaurants/{restaurantId}/reviews

## 4) Delivery Partners & Assignment (delivery-service)

### Delivery Partner Management
Delivery Partner (JWT role: DELIVERY_PARTNER):
- POST /api/delivery/partners
  Body: 
  {
    "name": "Mike Johnson",
    "phoneNumber": "+1 555-999-8888",
    "vehicleDetails": "Honda Civic - License: ABC123",
    "status": "AVAILABLE"
  }
- GET /api/delivery/partners/profile
- PUT /api/delivery/partners/status?status=AVAILABLE|ON_DELIVERY|OFFLINE

Public/Auth:
- GET /api/delivery/partners/available

### Delivery Assignment & Tracking
Admin/Restaurant Owner:
- POST /api/delivery/assignments
  Minimal Body (recommended):
  {
    "orderId": 1001,
    "tip": 2.50,
    "specialInstructions": "Ring doorbell twice. Leave at door if no answer."
  }
  Notes:
  - Server enriches pickup (from restaurant) and delivery (from order) automatically
  - Optional override: You may still send any of these to override defaults:
    restaurantId, customerId, pickupAddress, pickupLatitude, pickupLongitude, deliveryAddress, deliveryLatitude, deliveryLongitude, deliveryFee

Delivery Partner (JWT role: DELIVERY_PARTNER):
- PUT /api/delivery/assignments/{assignmentId}/accept
- PUT /api/delivery/assignments/{assignmentId}/status?status=ASSIGNED|ACCEPTED|HEADING_TO_PICKUP|ARRIVED_AT_PICKUP|PICKED_UP|HEADING_TO_DELIVERY|ARRIVED_AT_DELIVERY|DELIVERED|CANCELLED|FAILED
- PUT /api/delivery/assignments/location
  Body: 
  {
    "latitude": 40.7505,
    "longitude": -73.9934
  }
- GET /api/delivery/assignments/my
- GET /api/delivery/assignments/active

Public/Customer:
- GET /api/delivery/assignments/order/{orderId}

### Reviews
- POST /api/delivery/partners/{partnerUserId}/reviews (JWT role: CUSTOMER)
  Body: { rating: 1-5, comment }
- GET /api/delivery/partners/{partnerUserId}/reviews

## 5) Orders (order-service)

Customer (JWT role: CUSTOMER):
- POST /api/orders
  Body: { restaurantId, addressId, items: [{ menuItemId, quantity }] }
- GET /api/orders/user?page=0&size=10&status=PREPARING|DELIVERED|...

Restaurant Owner/ADMIN:
- GET /api/orders/restaurant/{restaurantId}?page=0&size=10&status=...

Status updates (Owner/Admin/Delivery Partner):
- PUT /api/orders/{orderId}/status?status=PENDING|ACCEPTED|PREPARING|READY_FOR_PICKUP|ON_THE_WAY|DELIVERED|CANCELLED

ADMIN:
- GET /api/orders?page=0&size=10&status=...&restaurantId=...&userId=...

## 6) Payments & Enhanced Coupons (payment-service)

### Payment Endpoints
- POST /api/payments/intent
  Body: { orderId } or { amount, currency?, receipt? }
  Response: Razorpay order object; use for client payment.

- POST /api/payments/webhook
  Headers: X-Razorpay-Signature
  Body: Razorpay webhook payload

- GET /api/payments/transactions
- GET /api/payments/transactions/{id}
- GET /api/payments/transactions/order/{orderId}
- GET /api/payments/transactions/status/{status}
- GET /api/payments/transactions/restaurant/{restaurantId}

### Enhanced Coupon System
Customer/Public:
- POST /api/payments/coupons/validate
  Body: 
  {
    "code": "SAVE20",
    "orderAmount": 45.99,
    "userId": 12,
    "restaurantId": 5
  }
  Response: 
  {
    "valid": true,
    "message": "Coupon applied successfully",
    "discountAmount": 9.20,
    "finalAmount": 36.79,
    "couponCode": "SAVE20",
    "discountType": "PERCENTAGE",
    "couponId": 101
  }

- GET /api/payments/coupons/applicable?restaurantId={id}
  Response: List of applicable coupons for user

Admin Only (JWT role: ADMIN):
- POST /api/payments/coupons
  Body: 
  {
    "code": "WELCOME10",
    "description": "10% off for new customers",
    "type": "PERCENTAGE",
    "discountValue": 10.00,
    "minimumOrderAmount": 25.00,
    "maximumDiscountAmount": 15.00,
    "validFrom": "2024-01-01T00:00:00",
    "validUntil": "2024-12-31T23:59:59",
    "totalUsageLimit": 1000,
    "usagePerUserLimit": 1,
    "restaurantId": null,
    "userId": null,
    "terms": "Valid for first-time customers only. Cannot be combined with other offers."
  }

- PUT /api/payments/coupons/{couponId}
  Body: 
  {
    "code": "UPDATED20",
    "description": "Updated 20% off for loyal customers",
    "type": "PERCENTAGE",
    "discountValue": 20.00,
    "minimumOrderAmount": 30.00,
    "maximumDiscountAmount": 25.00,
    "validFrom": "2024-02-01T00:00:00",
    "validUntil": "2024-11-30T23:59:59",
    "totalUsageLimit": 500,
    "usagePerUserLimit": 2,
    "terms": "Valid for customers with 5+ previous orders."
  }
  
- GET /api/payments/coupons?page=0&size=10
- GET /api/payments/coupons/{couponId}
- DELETE /api/payments/coupons/{couponId} (deactivates coupon)

Coupon Types: PERCENTAGE, FIXED_AMOUNT, FREE_DELIVERY, BOGO, COMBO_DEAL

### Coupon Examples by Type:
**PERCENTAGE Coupon:**
{
  "code": "SAVE15",
  "description": "15% off your order",
  "type": "PERCENTAGE",
  "discountValue": 15.00,
  "minimumOrderAmount": 20.00,
  "maximumDiscountAmount": 10.00
}

**FIXED_AMOUNT Coupon:**
{
  "code": "FLAT5",
  "description": "$5 off your order",
  "type": "FIXED_AMOUNT",
  "discountValue": 5.00,
  "minimumOrderAmount": 25.00
}

**FREE_DELIVERY Coupon:**
{
  "code": "FREEDEL",
  "description": "Free delivery on any order",
  "type": "FREE_DELIVERY",
  "discountValue": 3.00,
  "minimumOrderAmount": 15.00
}

**Restaurant-Specific Coupon:**
{
  "code": "PIZZA20",
  "description": "20% off at Pizza Palace only",
  "type": "PERCENTAGE",
  "discountValue": 20.00,
  "restaurantId": 5,
  "minimumOrderAmount": 30.00
}

## Testing Flow

### Phase 1: Basic Setup
1. **Register as Customer**
   ```
   POST /auth/register
   {
     "name": "John Customer",
     "email": "john@customer.com",
     "phone": "+1 555-111-2222",
     "password": "password123"
   }
   ```

2. **Create Admin User** (Use existing admin or create via database)
   ```
   POST /admin/users?role=ADMIN
   {
     "name": "Admin User",
     "email": "admin@quickbite.com",
     "phone": "+1 555-000-0000",
     "password": "admin123"
   }
   ```

3. **Create Restaurant Owner**
   ```
   POST /admin/users?role=RESTAURANT_OWNER
   {
     "name": "Restaurant Owner",
     "email": "owner@restaurant.com",
     "phone": "+1 555-333-4444",
     "password": "owner123"
   }
   ```

4. **Create Delivery Partner**
   ```
   POST /admin/users?role=DELIVERY_PARTNER
   {
     "name": "Delivery Partner",
     "email": "partner@delivery.com",
     "phone": "+1 555-555-6666",
     "password": "partner123"
   }
   ```

### Phase 2: Restaurant Approval Workflow
1. **Login as Restaurant Owner** -> Get JWT token
2. **Create Restaurant** (triggers pending approval email)
   ```
   POST /api/restaurants
   {
     "name": "Test Pizza Palace",
     "address": "123 Test Street, Test City",
     "contactNumber": "+1 555-777-8888",
     "cuisineType": "Italian",
     "openingTime": "10:00:00",
     "closingTime": "22:00:00",
     "description": "Best pizza in town",
     "deliveryTime": "30-45 mins",
     "deliveryFee": 3.99,
     "minimumOrder": 15.0
   }
   ```

3. **Login as Admin** -> Get JWT token
4. **View Pending Restaurants**
   ```
   GET /api/restaurants/admin/pending
   ```

5. **Approve Restaurant** (triggers approval email)
   ```
   PUT /api/restaurants/admin/{restaurantId}/approve
   {
     "approvalNotes": "Restaurant meets all quality standards. Welcome to QuickBite!"
   }
   ```

### Phase 3: Enhanced Coupon System
1. **Login as Admin** -> Create coupons
   ```
   POST /api/payments/coupons
   {
     "code": "WELCOME20",
     "description": "20% off for new customers",
     "type": "PERCENTAGE",
     "discountValue": 20.00,
     "minimumOrderAmount": 25.00,
     "maximumDiscountAmount": 15.00,
     "validFrom": "2024-01-01T00:00:00",
     "validUntil": "2024-12-31T23:59:59",
     "totalUsageLimit": 100,
     "usagePerUserLimit": 1
   }
   ```

2. **Login as Customer** -> Validate coupon
   ```
   POST /api/payments/coupons/validate
   {
     "code": "WELCOME20",
     "orderAmount": 45.99,
     "userId": 1,
     "restaurantId": 1
   }
   ```

### Phase 4: Delivery Assignment & Tracking
1. **Login as Delivery Partner** -> Create profile
   ```
   POST /api/delivery/partners
   {
     "name": "Mike Delivery",
     "phoneNumber": "+1 555-999-8888",
     "vehicleDetails": "Honda Civic - ABC123",
     "status": "AVAILABLE"
   }
   ```

2. **Login as Admin/Restaurant Owner** -> Assign delivery
   ```
   POST /api/delivery/assignments
   {
     "orderId": 1,
     "restaurantId": 1,
     "customerId": 1,
     "pickupAddress": "Test Pizza Palace, 123 Test Street",
     "deliveryAddress": "456 Customer Street, Apt 2B",
     "pickupLatitude": 40.7128,
     "pickupLongitude": -74.0060,
     "deliveryLatitude": 40.7589,
     "deliveryLongitude": -73.9851,
     "deliveryFee": 3.99,
     "tip": 2.50
   }
   ```

3. **Login as Delivery Partner** -> Accept and track
   ```
   PUT /api/delivery/assignments/{assignmentId}/accept
   
   PUT /api/delivery/assignments/{assignmentId}/status?status=PICKED_UP
   
   PUT /api/delivery/assignments/location
   {
     "latitude": 40.7505,
     "longitude": -73.9934
   }
   ```

4. **Customer** -> Track delivery
   ```
   GET /api/delivery/assignments/order/{orderId}
   ```

### Phase 5: Complete Order Flow
1. **Customer** -> Browse restaurants, create order
2. **Restaurant Owner** -> Accept order, update status
3. **System** -> Auto-assign delivery partner
4. **Delivery Partner** -> Accept, pickup, deliver
5. **Customer** -> Apply coupon, make payment, track delivery
6. **All parties** -> Leave reviews

### Phase 6: Admin Management
1. **View all restaurants by status**
   ```
   GET /api/restaurants/admin/all?status=APPROVED&page=0&size=10
   ```

2. **Manage coupons**
   ```
   GET /api/payments/coupons?page=0&size=10
   PUT /api/payments/coupons/{couponId}
   DELETE /api/payments/coupons/{couponId}
   ```

3. **Monitor delivery assignments**
   ```
   GET /api/delivery/assignments/order/{orderId}
   ```

## Important Notes
- **Email Configuration**: Set EMAIL_USERNAME and EMAIL_PASSWORD environment variables for Gmail SMTP
- **JWT Tokens**: Include `Authorization: Bearer <token>` header for protected endpoints
- **Role Validation**: Ensure users have correct roles for accessing specific endpoints
- **Database**: All services should connect to the same MySQL database
- **Service Discovery**: Ensure Eureka is running and all services are registered


