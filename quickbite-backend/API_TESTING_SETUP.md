# 🚀 QuickBite API Testing Setup Guide

## 📋 **Quick Start (5 Minutes)**

### **Step 1: Start Services**
```bash
# Terminal 1 - Eureka Server
cd quickbite-backend/eureka-server
mvn spring-boot:run

# Terminal 2 - API Gateway
cd quickbite-backend/api-gateway
mvn spring-boot:run

# Terminal 3 - Auth Service
cd quickbite-backend/auth-service
mvn spring-boot:run

# Terminal 4 - User Service
cd quickbite-backend/user-service
mvn spring-boot:run

# Terminal 5 - Restaurant Service
cd quickbite-backend/restaurant-service
mvn spring-boot:run

# Terminal 6 - Order Service
cd quickbite-backend/order-service
mvn spring-boot:run

# Terminal 7 - Delivery Service
cd quickbite-backend/delivery-service
mvn spring-boot:run

# Terminal 8 - Payment Service
cd quickbite-backend/payment-service
mvn spring-boot:run
```

### **Step 2: Import Postman Collection**
1. Open Postman
2. Click **Import** button
3. Select `QuickBite_API_Collection.postman_collection.json`
4. Select `QuickBite_Environment.postman_environment.json`
5. Click **Import**

### **Step 3: Test Authentication**
1. Select **QuickBite Environment**
2. Run **"Register User"** request
3. Check that `auth_token` is automatically set
4. Run **"Login User"** to verify

### **Step 4: Test Core Features**
1. **Restaurants**: Get all restaurants
2. **Orders**: Place a test order
3. **Payments**: Create payment intent
4. **Delivery**: Create delivery partner

---

## 🔧 **Service Ports**

| Service | Port | Health Check |
|---------|------|--------------|
| Eureka Server | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080/actuator/health |
| Auth Service | 9001 | http://localhost:9001/actuator/health |
| User Service | 9002 | http://localhost:9002/actuator/health |
| Restaurant Service | 9003 | http://localhost:9003/actuator/health |
| Order Service | 9004 | http://localhost:9004/actuator/health |
| Delivery Service | 9005 | http://localhost:9005/actuator/health |
| Payment Service | 8084 | http://localhost:8084/actuator/health |

---

## 🧪 **Test Scenarios**

### **Scenario 1: Customer Journey**
1. Register → Login → Create Profile → Add Address
2. Browse Restaurants → View Menu → Place Order
3. Create Payment Intent → Complete Payment

### **Scenario 2: Restaurant Owner Journey**
1. Register as Restaurant Owner → Login
2. Create Restaurant → Add Menu Categories → Add Menu Items
3. View Orders → Update Order Status

### **Scenario 3: Delivery Partner Journey**
1. Register as Delivery Partner → Login
2. Create Profile → Set Status to Available
3. Update Location → View Available Orders

### **Scenario 4: Admin Journey**
1. Login as Admin
2. View All Restaurants → Approve/Reject
3. View All Orders → Monitor System
4. View All Transactions → Financial Overview

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **1. Connection Refused**
```bash
# Check if services are running
curl http://localhost:8080/actuator/health

# Check Eureka dashboard
open http://localhost:8761
```

#### **2. 401 Unauthorized**
- Verify JWT token is set in environment
- Check if token is expired
- Ensure Authorization header format: `Bearer <token>`

#### **3. 404 Not Found**
- Verify API Gateway is running
- Check if service is registered with Eureka
- Ensure correct endpoint URLs

#### **4. 500 Internal Server Error**
- Check service logs
- Verify database connection
- Check if all dependencies are available

#### **5. Database Issues**
```sql
-- Check if database exists
SHOW DATABASES;

-- Check if tables are created
USE quickbite_db;
SHOW TABLES;
```

---

## 📊 **Health Checks**

### **Check All Services:**
```bash
# API Gateway
curl http://localhost:8080/actuator/health

# Individual Services
curl http://localhost:9001/actuator/health  # Auth
curl http://localhost:9002/actuator/health  # User
curl http://localhost:9003/actuator/health  # Restaurant
curl http://localhost:9004/actuator/health  # Order
curl http://localhost:9005/actuator/health  # Delivery
curl http://localhost:8084/actuator/health  # Payment
```

### **Eureka Dashboard:**
- Open: http://localhost:8761
- Check if all services are registered
- Status should be "UP" for all services

---

## 🔍 **Debugging Tips**

### **1. Check Logs**
```bash
# Check service logs for errors
tail -f logs/application.log

# Check specific service
cd quickbite-backend/auth-service
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```

### **2. Database Debugging**
```sql
-- Check user table
SELECT * FROM users;

-- Check restaurants
SELECT * FROM restaurants;

-- Check orders
SELECT * FROM orders;

-- Check payments
SELECT * FROM payment_transactions;
```

### **3. Network Debugging**
```bash
# Check if ports are open
netstat -tulpn | grep :8080
netstat -tulpn | grep :8761

# Test API Gateway
curl -v http://localhost:8080/api/restaurants
```

---

## 📈 **Performance Testing**

### **Load Testing with Postman:**
1. Select collection
2. Click **Run** button
3. Set **Iterations**: 10
4. Set **Delay**: 100ms
5. Click **Run QuickBite API Collection**

### **Monitor Performance:**
- Response times should be < 2 seconds
- Error rate should be < 1%
- Memory usage should be stable

---

## 🎯 **Success Criteria**

### **All Tests Pass When:**
- [ ] All services start without errors
- [ ] Eureka shows all services as "UP"
- [ ] API Gateway routes requests correctly
- [ ] Authentication works end-to-end
- [ ] Database operations complete successfully
- [ ] Payment integration works
- [ ] Cross-service communication works
- [ ] Error handling is proper

---

## 📞 **Support**

### **If You Get Stuck:**
1. Check service logs first
2. Verify all services are running
3. Check Eureka dashboard
4. Test individual services directly
5. Check database connectivity

### **Common Commands:**
```bash
# Restart all services
pkill -f spring-boot
# Then restart each service

# Clear database
mysql -u root -p -e "DROP DATABASE quickbite_db; CREATE DATABASE quickbite_db;"

# Check Java processes
jps -l | grep quickbite
```

---

## 🚀 **Next Steps**

After successful testing:
1. **Frontend Integration**: Connect React app to APIs
2. **Production Setup**: Configure for production environment
3. **Monitoring**: Set up application monitoring
4. **Security**: Review and enhance security measures
5. **Performance**: Optimize for production load

---

**Happy Testing! 🎉**
