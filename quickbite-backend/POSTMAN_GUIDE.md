# QuickBite API - Postman Testing Guide

This guide provides step-by-step instructions on how to test the QuickBite backend API using Postman.

## 1. Prerequisites

- **Postman:** Make sure you have the Postman desktop client installed.
- **Running Services:** Ensure all microservices (`discovery-service`, `api-gateway`, `auth-service`, etc.) and the MySQL database are running locally.
- **Environment Variables:** The application uses environment variables for configuration. Make sure you have set the following in your runtime environment:
  - `DB_URL=jdbc:mysql://localhost:3306/quickbite_db`
  - `DB_USERNAME=root`
  - `DB_PASSWORD=password`
  - `JWT_SECRET=your-super-secret-key-that-is-at-least-256-bits-long-for-hs256-encryption`

## 2. Postman Setup

### A. Create an Environment

1.  In Postman, click the "Environments" tab on the left.
2.  Click the `+` button to create a new environment.
3.  Name it "QuickBite Backend".
4.  Add the following variables:

| VARIABLE      | INITIAL VALUE                 |
|---------------|-------------------------------|
| `base_url`    | `http://localhost:8080`       |
| `jwt_token`   |                               |
| `user_id`     |                               |
| `customer_email` | `customer@example.com`        |
| `restaurant_owner_email` | `owner@example.com` |

### B. Create a Collection

1.  In Postman, click the "Collections" tab on the left.
2.  Click the `+` button to create a new collection.
3.  Name it "QuickBite API".

## 3. Testing Workflow

The general workflow is:
1.  **Register** a new user (e.g., a customer).
2.  **Login** with that user's credentials to get a JWT.
3.  **Use the JWT** in the `Authorization` header for all protected requests.

---

### Auth Service (`/auth`)

#### 1. Register a Customer

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/register`
- **Body:** `raw` (JSON)
  ```json
  {
      "email": "{{customer_email}}",
      "password": "password123",
      "role": "CUSTOMER"
  }
  ```

#### 2. Login and Get JWT

- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Body:** `raw` (JSON)
  ```json
  {
      "email": "{{customer_email}}",
      "password": "password123"
  }
  ```
- **Tests Tab:** Add the following script to automatically save the JWT and user ID after logging in.
  ```javascript
  const response = pm.response.json();
  pm.environment.set("jwt_token", response.token);

  // Basic JWT decoding to get user ID (for demo purposes)
  // In a real scenario, you might get this from a /me endpoint
  const tokenParts = response.token.split('.');
  const payload = JSON.parse(atob(tokenParts[1]));
  pm.environment.set("user_id", payload.sub); // Assuming 'sub' is the user email/id
  ```
  > **Note:** After running this, check your Postman Environment variables. The `jwt_token` should be populated.

---

### User Service (`/api/users`)

For all requests in this section, you must add an `Authorization` header.

- **Header:**
  - **Key:** `Authorization`
  - **Value:** `Bearer {{jwt_token}}`

#### 1. Get User Profile

- **Method:** `GET`
- **URL:** `{{base_url}}/api/users/profile`
- **Headers:**
  - `Authorization`: `Bearer {{jwt_token}}`
  - `X-User-Id`: `{{user_id}}` <!-- This header is added by the gateway in a real scenario, but we add it manually for testing -->

> **Note:** This will likely fail until you create a profile for this user.

#### 2. Create User Profile

- **Method:** `POST`
- **URL:** `{{base_url}}/api/users/profile`
- **Headers:**
  - `Authorization`: `Bearer {{jwt_token}}`
- **Body:** `raw` (JSON)
  ```json
  {
      "userId": {{user_id}},
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "123-456-7890"
  }
  ```

#### 3. Add an Address

- **Method:** `POST`
- **URL:** `{{base_url}}/api/users/addresses`
- **Headers:**
  - `Authorization`: `Bearer {{jwt_token}}`
  - `X-User-Id`: `{{user_id}}`
- **Body:** `raw` (JSON)
  ```json
  {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "type": "Home"
  }
  ```

---

This guide covers the initial setup and basic testing flow. You can expand your Postman collection by adding requests for the **Restaurant**, **Order**, and **Delivery** services, following the patterns above. Remember to always include the `Authorization` header with the Bearer token for protected endpoints.