# E-Commerce Microservices Backend - MERN Stack

A complete microservices-based e-commerce backend built with Node.js, Express, and MongoDB.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 5000)                      │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│          │          │          │          │          │          │
▼          ▼          ▼          ▼          ▼          ▼          ▼
User     Product   Cart       Order      Payment    Review    (Frontend)
Service   Service   Service    Service    Service    Service
(5001)    (5002)    (5003)     (5004)     (5005)     (5006)
│          │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
                        ▼
                    MongoDB Cluster
```

## 🚀 Services Overview

### 1. User Service (Port 5001)
**Manages user authentication and profiles**
- Registration & Login (JWT-based)
- Profile management
- Role-based access (user/admin)

**Endpoints:**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID

### 2. Product Service (Port 5002)
**Manages product catalog and inventory**
- CRUD operations for products
- Search and filtering by category
- Stock management

**Endpoints:**
- `GET /api/products` - Get all products (with search/category filter)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/bulk/ids` - Get multiple products by IDs

### 3. Cart Service (Port 5003)
**Manages user shopping carts**
- Add/remove items from cart
- Update quantity
- Calculate total

**Endpoints:**
- `GET /api/cart` - Get user cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/update` - Update item quantity (protected)
- `DELETE /api/cart/remove` - Remove item from cart (protected)
- `DELETE /api/cart/clear` - Clear entire cart (protected)

### 4. Order Service (Port 5004)
**Manages orders and order history**
- Create orders from cart
- Track order status
- Order history management

**Endpoints:**
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders/admin/all` - Get all orders (admin only)
- `PUT /api/orders/payment-status/update` - Update payment status (service-to-service)

### 5. Payment Service (Port 5005)
**Manages payment transactions**
- Initiate payments
- Confirm/complete payments
- Track transaction status
- Mock payment processing

**Endpoints:**
- `POST /api/payments/initiate` - Initiate payment (protected)
- `POST /api/payments/confirm` - Confirm payment (protected)
- `POST /api/payments/fail` - Mark payment as failed (protected)
- `GET /api/payments/user` - Get user payments (protected)
- `GET /api/payments/:orderId` - Get payment by order ID

### 6. Review Service (Port 5006)
**Manages product reviews and ratings**
- Create/update/delete reviews
- Display reviews by product
- Rating system (1-5 stars)

**Endpoints:**
- `GET /api/reviews/product/:productId` - Get reviews for product
- `POST /api/reviews` - Create review (protected)
- `PUT /api/reviews/:id` - Update review (protected - owner only)
- `DELETE /api/reviews/:id` - Delete review (protected - owner only)
- `GET /api/reviews/user/my-reviews` - Get user's reviews (protected)
- `GET /api/reviews/:id` - Get review by ID

### 7. API Gateway (Port 3000)
**Central entry point for all services**
- Routes requests to appropriate microservices
- Handles CORS
- Service discovery
- **Swagger UI: http://localhost:3000/api-docs**

**Health Check:**
- `GET /health` - Gateway health status

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Step 1: Clone Repository
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro
```

### Step 2: Install Dependencies for All Services
```bash
# User Service
cd user-service
npm install
cd ..

# Product Service
cd product-service
npm install
cd ..

# Cart Service
cd cart-service
npm install
cd ..

# Order Service
cd order-service
npm install
cd ..

# Payment Service
cd payment-service
npm install
cd ..

# Review Service
cd review-service
npm install
cd ..

# API Gateway
cd api-gateway
npm install
cd ..
```

### Step 3: Configure Environment Variables
All `.env` files are already created with the MongoDB connection URL:
```
mongodb+srv://user:user1@cluster0.v0dwt8o.mongodb.net
```

Each service has its own database (user-service, product-service, etc.)

### Step 4: Start All Services

**Terminal 1 - API Gateway:**
```bash
cd api-gateway
npm run dev
# Gateway runs on http://localhost:5000
```

**Terminal 2 - User Service:**
```bash
cd user-service
npm run dev
# Runs on http://localhost:5001
```

**Terminal 3 - Product Service:**
```bash
cd product-service
npm run dev
# Runs on http://localhost:5002
```

**Terminal 4 - Cart Service:**
```bash
cd cart-service
npm run dev
# Runs on http://localhost:5003
```

**Terminal 5 - Order Service:**
```bash
cd order-service
npm run dev
# Runs on http://localhost:5004
```

**Terminal 6 - Payment Service:**
```bash
cd payment-service
npm run dev
# Runs on http://localhost:5005
```

**Terminal 7 - Review Service:**
```bash
cd review-service
npm run dev
# Runs on http://localhost:5006
```

## 🧪 Testing the Complete Flow

**📚 Easiest Way: Use Swagger UI**

Once all services are running:
1. Open http://localhost:3000/api-docs
2. Click on any endpoint to expand
3. Click "Try it out"
4. Fill in the parameters
5. Click "Execute" to test

Or use curl commands below:

### 1. User Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123def456ghi789",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Save the token for next requests!**

### 2. Create Products (Admin - Replace token)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics",
    "imageUrl": "https://example.com/laptop.jpg"
  }'
```

### 3. Get All Products
```bash
curl http://localhost:5000/api/products
```

### 4. Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "65abc456def789ghi012",
    "title": "Laptop",
    "price": 999.99,
    "quantity": 1
  }'
```

### 5. View Cart
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/cart
```

### 6. Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "65abc456def789ghi012",
        "title": "Laptop",
        "price": 999.99,
        "quantity": 1
      }
    ],
    "shippingAddress": "123 Main St, City, Country",
    "totalAmount": 999.99
  }'
```

### 7. Initiate Payment
```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "65abc789def012ghi345",
    "amount": 999.99,
    "method": "credit_card"
  }'
```

### 8. Confirm Payment
```bash
curl -X POST http://localhost:5000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "65abc789def012ghi345"
  }'
```

### 9. Add Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "65abc456def789ghi012",
    "rating": 5,
    "comment": "Excellent laptop, highly recommended!",
    "userName": "John Doe"
  }'
```

### 10. Get Product Reviews
```bash
curl http://localhost:5000/api/reviews/product/65abc456def789ghi012
```

## 📊 Database Schema

### User Collection
```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  address: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Collection
```
{
  _id: ObjectId,
  userId: String (unique),
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```
{
  _id: ObjectId,
  userId: String,
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  shippingAddress: String,
  totalAmount: Number,
  status: String (pending/confirmed/shipped/delivered/cancelled),
  paymentStatus: String (pending/completed/failed),
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Collection
```
{
  _id: ObjectId,
  orderId: String (unique),
  userId: String,
  amount: Number,
  method: String (credit_card/debit_card/online_banking/cash_on_delivery),
  status: String (pending/completed/failed),
  transactionId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Collection
```
{
  _id: ObjectId,
  productId: String,
  userId: String,
  userName: String,
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Token is received after user registration or login and contains:
- User ID
- User Role (user/admin)
- Expiration time: 7 days

## 📝 Project Structure

```
ecommerce-backend--micro/
├── api-gateway/
│   ├── server.js
│   ├── .env
│   └── package.json
├── user-service/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   └── User.js
│   ├── controllers/
│   │   └── userController.js
│   ├── routes/
│   │   └── userRoutes.js
│   └── middleware/
│       └── auth.js
├── product-service/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   └── Product.js
│   ├── controllers/
│   │   └── productController.js
│   ├── routes/
│   │   └── productRoutes.js
│   └── middleware/
│       └── adminAuth.js
├── cart-service/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   └── Cart.js
│   ├── controllers/
│   │   └── cartController.js
│   ├── routes/
│   │   └── cartRoutes.js
│   └── middleware/
│       └── auth.js
├── order-service/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   └── Order.js
│   ├── controllers/
│   │   └── orderController.js
│   ├── routes/
│   │   └── orderRoutes.js
│   └── middleware/
│       └── auth.js
├── payment-service/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   └── Payment.js
│   ├── controllers/
│   │   └── paymentController.js
│   ├── routes/
│   │   └── paymentRoutes.js
│   └── middleware/
│       └── auth.js
├── review-service/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   └── Review.js
│   ├── controllers/
│   │   └── reviewController.js
│   ├── routes/
│   │   └── reviewRoutes.js
│   └── middleware/
│       └── auth.js
└── README.md
```

## 🛠️ Technologies Used

- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **HTTP Proxy:** http-proxy-middleware (API Gateway)
- **CORS:** cors middleware
- **Environment:** dotenv

## ⚙️ Configuration

### JWT Secret
Change the JWT secret in all service `.env` files for production:
```
JWT_SECRET=your_secure_secret_key_here
```

### MongoDB Connection
All services are configured to use:
```
mongodb+srv://user:user1@cluster0.v0dwt8o.mongodb.net
```

To change credentials, update each service's `.env` file.

## 📌 Key Features

✅ Complete microservices architecture  
✅ JWT-based authentication  
✅ Role-based access control (user/admin)  
✅ Separate databases per service  
✅ Service-to-service communication via HTTP  
✅ Cart management with auto-calculation  
✅ Order tracking with status management  
✅ Payment processing (mock)  
✅ Product reviews and ratings  
✅ Error handling and validation  
✅ CORS enabled for frontend integration  

## 🚨 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB Atlas is running
- Check internet connection for MongoDB Atlas
- Verify credentials in `.env` files
- Ensure IP is whitelisted in MongoDB Atlas

### Port Already in Use
```bash
# Find process using port
lsof -i :PORT_NUMBER

# Kill process
kill -9 PID
```

### Service Not Responding
- Check service is running on correct port
- Verify `.env` files have correct URLs
- Check logs in terminal where service is running

## 📚 Next Steps

1. Build React frontend to consume these APIs
2. Add more payment gateways (Stripe, PayPal)
3. Implement event-driven architecture (Kafka/RabbitMQ)
4. Add caching layer (Redis)
5. Implement API rate limiting
6. Add comprehensive logging
7. Deploy to production (Docker, Kubernetes)

## 📄 License

ISC

---

**Created:** March 2026  
**For:** IT4020 - MTIT Assignment 2
