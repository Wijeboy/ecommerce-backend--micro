# API Reference - Quick Lookup

## 🕸️ Access Swagger UI

**http://localhost:3000/api-docs**

This is the recommended way to test all APIs. Simply:
1. Click on any endpoint
2. Click "Try it out"
3. Fill in the parameters
4. Click "Execute"

---

## Authentication & Security

All endpoints marked with 🔒 require JWT token in header:
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Admin-only endpoints marked with 👨‍💼 require `role: "admin"`

---

## User Service (Port 5001)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | ❌ | Register new user |
| POST | `/api/users/login` | ❌ | Login & get JWT token |
| GET | `/api/users/profile` | 🔒 | Get logged-in user profile |
| PUT | `/api/users/profile` | 🔒 | Update user profile |
| GET | `/api/users` | 🔒 👨‍💼 | Get all users (admin) |
| GET | `/api/users/:id` | ❌ | Get user by ID |

---

## Product Service (Port 5002)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | Get all products (with ?search & ?category) |
| GET | `/api/products/:id` | ❌ | Get product by ID |
| POST | `/api/products` | 🔒 👨‍💼 | Create product |
| PUT | `/api/products/:id` | 🔒 👨‍💼 | Update product |
| DELETE | `/api/products/:id` | 🔒 👨‍💼 | Delete product |
| POST | `/api/products/bulk/ids` | ❌ | Get multiple products by IDs |

---

## Cart Service (Port 5003)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | 🔒 | Get user cart |
| POST | `/api/cart/add` | 🔒 | Add item to cart |
| PUT | `/api/cart/update` | 🔒 | Update item quantity |
| DELETE | `/api/cart/remove` | 🔒 | Remove item from cart |
| DELETE | `/api/cart/clear` | 🔒 | Clear entire cart |

---

## Order Service (Port 5004)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | 🔒 | Create order from cart |
| GET | `/api/orders` | 🔒 | Get user's orders |
| GET | `/api/orders/:id` | 🔒 | Get order by ID |
| PUT | `/api/orders/:id/status` | 🔒 👨‍💼 | Update order status (pending/confirmed/shipped/delivered/cancelled) |
| GET | `/api/orders/admin/all` | 🔒 👨‍💼 | Get all orders (admin) |
| PUT | `/api/orders/payment-status/update` | ⚙️ | Service-to-service: Update payment status |

---

## Payment Service (Port 5005)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/initiate` | 🔒 | Start payment process |
| POST | `/api/payments/confirm` | 🔒 | Confirm payment (generates transaction ID) |
| POST | `/api/payments/fail` | 🔒 | Mark payment as failed |
| GET | `/api/payments/user` | 🔒 | Get user's payments |
| GET | `/api/payments/:orderId` | ❌ | Get payment by order ID |

---

## Review Service (Port 5006)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/product/:productId` | ❌ | Get all reviews for product |
| GET | `/api/reviews/:id` | ❌ | Get review by ID |
| POST | `/api/reviews` | 🔒 | Create product review |
| PUT | `/api/reviews/:id` | 🔒 | Update review (owner only) |
| DELETE | `/api/reviews/:id` | 🔒 | Delete review (owner only) |
| GET | `/api/reviews/user/my-reviews` | 🔒 | Get user's reviews |

---

## Health Checks

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `http://localhost:5000/health` | API Gateway health |
| GET | `http://localhost:5001/health` | User Service health |
| GET | `http://localhost:5002/health` | Product Service health |
| GET | `http://localhost:5003/health` | Cart Service health |
| GET | `http://localhost:5004/health` | Order Service health |
| GET | `http://localhost:5005/health` | Payment Service health |
| GET | `http://localhost:5006/health` | Review Service health |

---

## Request & Response Examples

### User Registration
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Create Product
```json
POST /api/products
Headers: Authorization: Bearer <TOKEN>
{
  "title": "Laptop",
  "description": "High-performance computer",
  "price": 999.99,
  "stock": 50,
  "category": "Electronics",
  "imageUrl": "https://example.com/image.jpg"
}

Response:
{
  "message": "Product created successfully",
  "product": {
    "_id": "65abc456",
    "title": "Laptop",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics"
  }
}
```

### Add to Cart
```json
POST /api/cart/add
Headers: Authorization: Bearer <TOKEN>
{
  "productId": "65abc456",
  "title": "Laptop",
  "price": 999.99,
  "quantity": 1
}

Response:
{
  "message": "Item added to cart",
  "cart": {
    "userId": "65abc123",
    "items": [
      {
        "productId": "65abc456",
        "title": "Laptop",
        "price": 999.99,
        "quantity": 1
      }
    ],
    "total": 999.99
  }
}
```

### Create Order
```json
POST /api/orders
Headers: Authorization: Bearer <TOKEN>
{
  "items": [
    {
      "productId": "65abc456",
      "title": "Laptop",
      "price": 999.99,
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Main St, City, Country",
  "totalAmount": 999.99
}

Response:
{
  "message": "Order created successfully",
  "order": {
    "_id": "65abc789",
    "userId": "65abc123",
    "items": [...],
    "totalAmount": 999.99,
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

### Create Review
```json
POST /api/reviews
Headers: Authorization: Bearer <TOKEN>
{
  "productId": "65abc456",
  "rating": 5,
  "comment": "Excellent product!",
  "userName": "John Doe"
}

Response:
{
  "message": "Review created successfully",
  "review": {
    "_id": "65abcxyz",
    "productId": "65abc456",
    "userId": "65abc123",
    "rating": 5,
    "comment": "Excellent product!"
  }
}
```

---

## Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not admin when required |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal service error |

---

## Query Parameters

### Get Products
```
GET /api/products?search=laptop&category=Electronics
```

### Get Reviews by Product
```
GET /api/reviews/product/65abc456
```

---

## HTTP Methods Cheat Sheet

| Method | Purpose | Use Case |
|--------|---------|----------|
| GET | Retrieve data | Fetch users, products, reviews |
| POST | Create data | Register user, create order |
| PUT | Update data | Update profile, update product |
| DELETE | Remove data | Delete product, remove from cart |

---

## Token Format

```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YWJjMTIzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.abc123...
```

**Contains:**
- User ID
- User Role (user/admin)
- Issued At (iat)
- Expiration (exp) - 7 days from login

---

## Database Collections

| Service | Collection | Key Fields |
|---------|-----------|-----------|
| User | Users | email, password, role |
| Product | Products | title, price, stock, category |
| Cart | Carts | userId, items[], total |
| Order | Orders | userId, items[], status, paymentStatus |
| Payment | Payments | orderId, amount, status, transactionId |
| Review | Reviews | productId, userId, rating, comment |

---

## Environment Variables by Service

All `.env` files already contain:

```
PORT=5001-5006
MONGODB_URI=mongodb+srv://user:user1@cluster0.v0dwt8o.mongodb.net
JWT_SECRET=your_jwt_secret_key_here_change_later
NODE_ENV=development
```

Service-specific URLs for inter-service communication also included.

---

## Useful curl Commands

### Test API Gateway
```bash
curl http://localhost:3000/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Get Cart (with token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/cart
```

---

## Rate Limits & Performance

- No rate limiting implemented (add for production)
- MongoDB queries optimized with indexing
- JWT tokens cached in memory
- CORS enabled for all origins (restrict in production)

---

**Last Updated:** March 28, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
