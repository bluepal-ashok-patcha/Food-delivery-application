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
- PUT /api/restaurants/{id}/status?status=PENDING_APPROVAL|APPROVED|REJECTED|ACTIVE|INACTIVE

Reviews:
- POST /api/restaurants/{restaurantId}/reviews (JWT required)
  Body: { rating: 1-5, comment }
- GET /api/restaurants/{restaurantId}/reviews

## 4) Delivery Partners (delivery-service)

Delivery Partner (JWT role: DELIVERY_PARTNER):
- POST /api/delivery/partners
  Body: { name, phoneNumber, vehicleDetails, status }
- GET /api/delivery/partners/profile
- PUT /api/delivery/partners/status?status=AVAILABLE|ON_DELIVERY|OFFLINE
- PUT /api/delivery/partners/location
  Body: { latitude, longitude }

Public/Auth:
- GET /api/delivery/partners/available

Reviews:
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

## 6) Payments & Coupons (payment-service)

- POST /api/payments/intent
  Body: { orderId } or { amount, currency?, receipt? }
  Response: Razorpay order object; use for client payment.

- POST /api/payments/webhook
  Headers: X-Razorpay-Signature
  Body: Razorpay webhook payload

- GET /api/payments/coupons/validate?code=SAVE10&amount=250

- GET /api/payments/transactions
- GET /api/payments/transactions/{id}
- GET /api/payments/transactions/order/{orderId}
- GET /api/payments/transactions/status/{status}
- GET /api/payments/transactions/restaurant/{restaurantId}

## Testing Flow
1. Register or login as CUSTOMER -> obtain token
2. Create/update profile and addresses (user-service)
3. Browse restaurants, create order -> create payment intent -> complete payment
4. Track order; view delivery partner availability and location
5. Leave restaurant and partner reviews
6. As ADMIN: manage users, restaurants, list/filter orders, check transactions


