# 🚀 QuickBite API Testing Guide - Postman Collection

## 📋 **Table of Contents**
1. [Setup & Prerequisites](#setup--prerequisites)
2. [Environment Variables](#environment-variables)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints Testing](#api-endpoints-testing)
5. [Test Scenarios](#test-scenarios)
6. [Error Handling](#error-handling)
7. [Collection Import](#collection-import)

---

## 🔧 **Setup & Prerequisites**

### **Required Services Running:**
```bash
# Start all services in order:
1. Eureka Server (port 8761)
2. API Gateway (port 8080)
3. Auth Service (port 9001)
4. User Service (port 9002)
5. Restaurant Service (port 9003)
6. Order Service (port 9004)
7. Delivery Service (port 9005)
8. Payment Service (port 8084)
```

### **Database Setup:**
```sql
-- Create database
CREATE DATABASE quickbite_db;

-- Database will be auto-created with tables via JPA
```

---

## 🌍 **Environment Variables**

Create a Postman environment with these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8080` | API Gateway URL |
| `auth_token` | `{{jwt_token}}` | JWT Token (auto-set) |
| `user_id` | `1` | Test User ID |
| `restaurant_id` | `1` | Test Restaurant ID |
| `order_id` | `1` | Test Order ID |
| `delivery_partner_id` | `1` | Test Delivery Partner ID |

---

## 🔐 **Authentication Flow**

### **1. User Registration**
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "CUSTOMER"
    }
  }
}
```

### **2. User Login**
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "User logged in successfully",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "CUSTOMER"
    }
  }
}
```

**⚠️ Important:** Copy the `token` from the response and set it in your environment variable `auth_token`.

---

## 🍽️ **Restaurant Service APIs**

### **1. Get All Restaurants (Public)**
```http
GET {{base_url}}/api/restaurants?page=0&size=10&sortBy=id&sortDir=asc&search=
```

### **2. Get Restaurant by ID (Public)**
```http
GET {{base_url}}/api/restaurants/1
```

### **3. Create Restaurant (Restaurant Owner)**
```http
POST {{base_url}}/api/restaurants
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Spice Palace",
  "description": "Authentic Indian cuisine",
  "cuisineType": "Indian",
  "address": "123 Main Street, City",
  "phone": "+1234567890",
  "email": "info@spicepalace.com",
  "rating": 4.5,
  "deliveryTime": "30-45 mins",
  "deliveryFee": 2.99,
  "minimumOrder": 15.00,
  "isOpen": true,
  "imageUrl": "https://example.com/restaurant.jpg",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

### **4. Update Restaurant Profile**
```http
PUT {{base_url}}/api/restaurants/1/profile
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Spice Palace Updated",
  "description": "Updated description",
  "phone": "+1234567890",
  "address": "456 New Street, City"
}
```

### **5. Add Menu Category**
```http
POST {{base_url}}/api/restaurants/1/categories
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Appetizers",
  "description": "Start your meal with our delicious appetizers"
}
```

### **6. Add Menu Item**
```http
POST {{base_url}}/api/restaurants/categories/1/items
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Chicken Tikka",
  "description": "Tender chicken marinated in spices",
  "price": 12.99,
  "imageUrl": "https://example.com/chicken-tikka.jpg",
  "isVegetarian": false,
  "isAvailable": true,
  "preparationTime": 20,
  "ingredients": ["Chicken", "Yogurt", "Spices"],
  "allergens": ["Dairy"],
  "nutritionInfo": {
    "calories": 250,
    "protein": 25,
    "carbs": 5,
    "fat": 12
  }
}
```

### **7. Update Menu Item**
```http
PUT {{base_url}}/api/restaurants/items/1
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Chicken Tikka (Updated)",
  "price": 14.99,
  "isAvailable": true
}
```

### **8. Delete Menu Item**
```http
DELETE {{base_url}}/api/restaurants/items/1
Authorization: Bearer {{auth_token}}
```

### **9. Update Restaurant Status (Admin)**
```http
PUT {{base_url}}/api/restaurants/1/status?status=ACTIVE
Authorization: Bearer {{auth_token}}
```

---

## 👤 **User Service APIs**

### **1. Create User Profile**
```http
POST {{base_url}}/api/users/profile
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "preferences": {
    "cuisineTypes": ["Indian", "Italian"],
    "dietaryRestrictions": ["Vegetarian"]
  }
}
```

### **2. Get User Profile**
```http
GET {{base_url}}/api/users/profile
Authorization: Bearer {{auth_token}}
```

### **3. Update User Profile**
```http
PUT {{base_url}}/api/users/profile
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "preferences": {
    "cuisineTypes": ["Indian", "Italian", "Chinese"],
    "dietaryRestrictions": ["Vegetarian"]
  }
}
```

### **4. Add Address**
```http
POST {{base_url}}/api/users/addresses
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true,
  "label": "Home",
  "instructions": "Ring the doorbell"
}
```

### **5. Update Address**
```http
PUT {{base_url}}/api/users/addresses/1
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "street": "456 Updated Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true,
  "label": "Home Updated"
}
```

### **6. Delete Address**
```http
DELETE {{base_url}}/api/users/addresses/1
Authorization: Bearer {{auth_token}}
```

---

## 🛒 **Order Service APIs**

### **1. Place Order**
```http
POST {{base_url}}/api/orders
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "restaurantId": 1,
  "addressId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "price": 12.99,
      "customization": {
        "spiceLevel": "Medium",
        "extraSauce": true
      }
    }
  ],
  "specialInstructions": "Please make it extra spicy"
}
```

### **2. Get User Orders**
```http
GET {{base_url}}/api/orders/user?page=0&size=10&sortBy=createdAt&sortDir=desc&status=
Authorization: Bearer {{auth_token}}
```

### **3. Get Restaurant Orders**
```http
GET {{base_url}}/api/orders/restaurant/1?page=0&size=10&sortBy=createdAt&sortDir=desc&status=
Authorization: Bearer {{auth_token}}
```

### **4. Update Order Status**
```http
PUT {{base_url}}/api/orders/1/status?status=PREPARING
Authorization: Bearer {{auth_token}}
```

**Available Order Statuses:**
- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY_FOR_PICKUP`
- `PICKED_UP`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`

---

## 🚚 **Delivery Service APIs**

### **1. Create Delivery Partner**
```http
POST {{base_url}}/api/delivery/partners
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Mike Johnson",
  "phone": "+1234567890",
  "vehicleType": "BIKE",
  "vehicleNumber": "ABC123",
  "licenseNumber": "DL123456",
  "isAvailable": true
}
```

### **2. Get Delivery Partner Profile**
```http
GET {{base_url}}/api/delivery/partners/profile
Authorization: Bearer {{auth_token}}
```

### **3. Update Partner Status**
```http
PUT {{base_url}}/api/delivery/partners/status?status=AVAILABLE
Authorization: Bearer {{auth_token}}
```

**Available Statuses:**
- `AVAILABLE`
- `BUSY`
- `OFFLINE`

### **4. Update Partner Location**
```http
PUT {{base_url}}/api/delivery/partners/location
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main Street, New York, NY"
}
```

### **5. Get Available Partners**
```http
GET {{base_url}}/api/delivery/partners/available
Authorization: Bearer {{auth_token}}
```

---

## 💳 **Payment Service APIs**

### **1. Create Payment Intent**
```http
POST {{base_url}}/api/payments/intent
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "amount": 25.99,
  "currency": "INR",
  "receipt": "order_123",
  "orderId": 1
}
```

### **2. Create Payment Intent (Without Order)**
```http
POST {{base_url}}/api/payments/intent
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "amount": 25.99,
  "currency": "INR",
  "receipt": "order_123"
}
```

### **3. Get All Transactions**
```http
GET {{base_url}}/api/payments/transactions
Authorization: Bearer {{auth_token}}
```

### **4. Get Transaction by ID**
```http
GET {{base_url}}/api/payments/transactions/1
Authorization: Bearer {{auth_token}}
```

### **5. Get Transactions by Order ID**
```http
GET {{base_url}}/api/payments/transactions/order/1
Authorization: Bearer {{auth_token}}
```

### **6. Get Transactions by Status**
```http
GET {{base_url}}/api/payments/transactions/status/created
Authorization: Bearer {{auth_token}}
```

### **7. Get Transactions by Restaurant ID**
```http
GET {{base_url}}/api/payments/transactions/restaurant/1
Authorization: Bearer {{auth_token}}
```

### **8. Payment Webhook (Razorpay)**
```http
POST {{base_url}}/api/payments/webhook
Content-Type: application/json
X-Razorpay-Signature: {{razorpay_signature}}

{
  "event": "payment.captured",
  "account_id": "acc_123",
  "created_at": 1234567890,
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "amount": 2599,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_123"
      }
    }
  }
}
```

---

## 🧪 **Test Scenarios**

### **Scenario 1: Complete Order Flow**
1. **Register User** → Get JWT token
2. **Create User Profile** → Set up user details
3. **Add Address** → Set delivery address
4. **Get Restaurants** → Browse available restaurants
5. **Get Restaurant Details** → View menu
6. **Place Order** → Create order
7. **Create Payment Intent** → Process payment
8. **Update Order Status** → Track order progress

### **Scenario 2: Restaurant Owner Flow**
1. **Register as Restaurant Owner** → Get JWT token
2. **Create Restaurant** → Set up restaurant
3. **Add Menu Categories** → Organize menu
4. **Add Menu Items** → Add food items
5. **Get Restaurant Orders** → View incoming orders
6. **Update Order Status** → Manage order flow

### **Scenario 3: Delivery Partner Flow**
1. **Register as Delivery Partner** → Get JWT token
2. **Create Delivery Partner Profile** → Set up profile
3. **Update Status to Available** → Go online
4. **Update Location** → Set current location
5. **Get Available Orders** → View delivery opportunities

### **Scenario 4: Admin Flow**
1. **Login as Admin** → Get admin JWT token
2. **Get All Restaurants** → View all restaurants
3. **Update Restaurant Status** → Approve/reject restaurants
4. **Get All Orders** → Monitor all orders
5. **Get All Transactions** → View payment data

---

## ❌ **Error Handling**

### **Common Error Responses:**

#### **400 Bad Request**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### **401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null
}
```

#### **403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions",
  "data": null
}
```

#### **404 Not Found**
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null
}
```

#### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

---

## 📥 **Collection Import**

### **Postman Collection JSON:**
```json
{
  "info": {
    "name": "QuickBite API Collection",
    "description": "Complete API testing collection for QuickBite food delivery platform",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080",
      "type": "string"
    },
    {
      "key": "auth_token",
      "value": "",
      "type": "string"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"password123\",\n  \"phone\": \"+1234567890\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/register",
              "host": ["{{base_url}}"],
              "path": ["auth", "register"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const response = pm.response.json();",
                  "    if (response.data && response.data.token) {",
                  "        pm.environment.set('auth_token', response.data.token);",
                  "        pm.environment.set('user_id', response.data.user.id);",
                  "    }",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    if (response.data && response.data.token) {",
                  "        pm.environment.set('auth_token', response.data.token);",
                  "        pm.environment.set('user_id', response.data.user.id);",
                  "    }",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🚀 **Quick Start Testing**

### **Step 1: Import Collection**
1. Open Postman
2. Click "Import"
3. Paste the collection JSON above
4. Set up environment variables

### **Step 2: Test Authentication**
1. Run "Register User" request
2. Copy the token from response
3. Set `auth_token` environment variable
4. Run "Login User" to verify

### **Step 3: Test Core Features**
1. **Restaurants**: Get all restaurants, create restaurant
2. **Orders**: Place order, get user orders
3. **Payments**: Create payment intent, get transactions
4. **Delivery**: Create delivery partner, update status

### **Step 4: Test Error Cases**
1. Invalid credentials
2. Missing required fields
3. Unauthorized access
4. Invalid IDs

---

## 📊 **Testing Checklist**

- [ ] **Authentication Flow**
  - [ ] User registration
  - [ ] User login
  - [ ] Token validation
  - [ ] Invalid credentials handling

- [ ] **Restaurant Management**
  - [ ] Get all restaurants
  - [ ] Get restaurant by ID
  - [ ] Create restaurant
  - [ ] Update restaurant profile
  - [ ] Menu management (categories, items)
  - [ ] Restaurant status updates

- [ ] **User Management**
  - [ ] Create user profile
  - [ ] Get user profile
  - [ ] Update user profile
  - [ ] Address management (CRUD)

- [ ] **Order Management**
  - [ ] Place order
  - [ ] Get user orders
  - [ ] Get restaurant orders
  - [ ] Update order status

- [ ] **Delivery Management**
  - [ ] Create delivery partner
  - [ ] Get partner profile
  - [ ] Update partner status
  - [ ] Location updates
  - [ ] Get available partners

- [ ] **Payment Processing**
  - [ ] Create payment intent
  - [ ] Get transactions
  - [ ] Filter transactions
  - [ ] Webhook handling

- [ ] **Error Handling**
  - [ ] Validation errors
  - [ ] Authentication errors
  - [ ] Authorization errors
  - [ ] Not found errors
  - [ ] Server errors

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Connection Refused**
   - Ensure all services are running
   - Check port numbers
   - Verify API Gateway is running on port 8080

2. **401 Unauthorized**
   - Check if JWT token is set correctly
   - Verify token is not expired
   - Ensure Authorization header format: `Bearer <token>`

3. **404 Not Found**
   - Verify API Gateway routes are configured
   - Check if service is registered with Eureka
   - Ensure correct endpoint URLs

4. **500 Internal Server Error**
   - Check service logs
   - Verify database connection
   - Check if all dependencies are available

5. **Validation Errors**
   - Check request body format
   - Verify required fields are present
   - Check data types and formats

---

## 📈 **Performance Testing**

### **Load Testing Scenarios:**
1. **Concurrent Users**: Test with 10, 50, 100 concurrent users
2. **Order Placement**: Test order creation under load
3. **Payment Processing**: Test payment intents under load
4. **Database Queries**: Test pagination and filtering

### **Monitoring:**
- Response times
- Error rates
- Memory usage
- Database connections
- Service health

---

## 🎯 **Success Criteria**

### **API Testing is Successful When:**
- [ ] All endpoints return expected status codes
- [ ] Response formats match documentation
- [ ] Authentication works correctly
- [ ] Error handling is proper
- [ ] Data validation works
- [ ] Pagination works correctly
- [ ] Filtering and sorting work
- [ ] Cross-service communication works
- [ ] Database operations are consistent
- [ ] Performance is acceptable

---

## 📞 **Support**

For issues or questions:
1. Check service logs
2. Verify database connectivity
3. Check Eureka service registration
4. Review API Gateway configuration
5. Test individual services directly

---

**Happy Testing! 🚀**
