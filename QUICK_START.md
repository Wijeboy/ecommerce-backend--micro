# 🚀 Quick Start Guide

## Implementation Complete! 

All 6 microservices + API Gateway are ready to use.

---

## 📁 What's Been Created

✅ **7 Complete Services:**
- user-service (Port 5001)
- product-service (Port 5002)
- cart-service (Port 5003)
- order-service (Port 5004)
- payment-service (Port 5005)
- review-service (Port 5006)
- api-gateway (Port 5000)

Each service includes:
- ✅ package.json (with dependencies)
- ✅ .env configuration (MongoDB URL already set)
- ✅ server.js (Express app setup)
- ✅ models/ (MongoDB schemas)
- ✅ controllers/ (business logic)
- ✅ routes/ (API endpoints)
- ✅ middleware/ (authentication, authorization)

---

## 🔧 Installation

### Option 1: Using the Setup Script (Recommended)

```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro
chmod +x SETUP.sh
./SETUP.sh
```

This will automatically install dependencies for all services.

### Option 2: Manual Installation

```bash
# For each service folder:
cd user-service && npm install
cd ../product-service && npm install
cd ../cart-service && npm install
cd ../order-service && npm install
cd ../payment-service && npm install
cd ../review-service && npm install
cd ../api-gateway && npm install
```

---

## ▶️ Running All Services

### Start Each in a Separate Terminal:

**Terminal 1 - API Gateway (Main Entry Point)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/api-gateway
npm run dev
# Runs on http://localhost:3000
# Swagger UI: http://localhost:3000/api-docs
```

**Terminal 2 - User Service**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/user-service
npm run dev
# Runs on http://localhost:5001
```

**Terminal 3 - Product Service**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/product-service
npm run dev
# Runs on http://localhost:5002
```

**Terminal 4 - Cart Service**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/cart-service
npm run dev
# Runs on http://localhost:5003
```

**Terminal 5 - Order Service**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/order-service
npm run dev
# Runs on http://localhost:5004
```

**Terminal 6 - Payment Service**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/payment-service
npm run dev
# Runs on http://localhost:5005
```

**Terminal 7 - Review Service**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/review-service
npm run dev
# Runs on http://localhost:5006
```

---

## ✅ Verify Services Running

Once all services are started, test the gateway:

```bash
curl http://localhost:3000/health
```

**Access Swagger API Documentation:**
```
Open in browser: http://localhost:3000/api-docs
```

---

## 📝 Testing APIs

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### 2. View Products

```bash
curl http://localhost:3000/api/products
```

### 3. Create a Product (Admin - Use test token)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Sample Product",
    "description": "A great product",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics",
    "imageUrl": "http://example.com/image.jpg"
  }'
```

### 4. Add to Cart (Use your token)

```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_FROM_STEP_3",
    "title": "Sample Product",
    "price": 99.99,
    "quantity": 1
  }'
```

### 5. Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID",
        "title": "Sample Product",
        "price": 99.99,
        "quantity": 1
      }
    ],
    "shippingAddress": "123 Street, City, Country",
    "totalAmount": 99.99
  }'
```

### 6. Process Payment

```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_FROM_STEP_5",
    "amount": 99.99,
    "method": "credit_card"
  }'
```

### 7. Confirm Payment

```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID"
  }'
```

### 8. Add Review

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "rating": 5,
    "comment": "Excellent product!",
    "userName": "Test User"
  }'
```

---

## 🧪 Use Postman Collection

Import the provided Postman collection for easy testing:

1. Open Postman
2. Click **Import**
3. Select `ecommerce-api.postman_collection.json`
4. All endpoints will be pre-configured!

## 🕸️ Use Swagger UI (Recommended)

The easiest way to test all APIs:

1. Start all services (see above)
2. Open in browser: **http://localhost:3000/api-docs**
3. Click on any endpoint to expand
4. Click "Try it out"
5. Fill in parameters and click "Execute"
6. See response in real-time!

---

## 📚 Documentation

See `README.md` for:
- ✅ Complete API documentation
- ✅ Database schemas
- ✅ Architecture diagram
- ✅ All endpoint details
- ✅ Error handling

---

## 🔑 Important Notes

### MongoDB Connection

All services use:
```
mongodb+srv://user:user1@cluster0.v0dwt8o.mongodb.net
```

Each service has its own database:
- user-service → user-service DB
- product-service → product-service DB
- cart-service → cart-service DB
- order-service → order-service DB
- payment-service → payment-service DB
- review-service → review-service DB

### JWT Authentication

- Login/Register to get a token
- Include token in header: `Authorization: Bearer <token>`
- Token expires in 7 days
- Change JWT_SECRET in .env files for production!

### Default Ports

```
API Gateway:    http://localhost:3000   (📚 Swagger: /api-docs)
User Service:   http://localhost:5001
Product Service: http://localhost:5002
Cart Service:   http://localhost:5003
Order Service:  http://localhost:5004
Payment Service: http://localhost:5005
Review Service: http://localhost:5006
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
✓ Check MongoDB Atlas is accessible
✓ Verify internet connection
✓ Ensure IP is whitelisted in MongoDB Atlas
✓ Check credentials in .env files
```

### Port Already in Use
```bash
# Find process on port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Service Not Responding
```
✓ Check service is running in its terminal
✓ Verify correct port in .env
✓ Check logs for errors
✓ Restart the service
```

### Can't Import in Postman
```
✓ Make sure ecommerce-api.postman_collection.json exists
✓ File should be in root directory
✓ Import as "Postman collection"
```

---

## 📊 Service Communication Flow

```
User Browser
    ↓
API Gateway (5000)
    ↓
Sends to appropriate service:
├─ /api/users → User Service (5001)
├─ /api/products → Product Service (5002)
├─ /api/cart → Cart Service (5003)
├─ /api/orders → Order Service (5004)
├─ /api/payments → Payment Service (5005)
└─ /api/reviews → Review Service (5006)
    ↓
Service queries MongoDB
    ↓
Response back through Gateway to Browser
```

---

## 🎯 Complete User Journey

```
1. Register/Login (User Service)
   ↓
2. Browse Products (Product Service)
   ↓
3. Add to Cart (Cart Service)
   ↓
4. Create Order (Order Service)
   ↓
5. Process Payment (Payment Service)
   ↓
6. Add Review (Review Service)
```

---

## 📞 Next Steps

1. **Install Dependencies:** Run setup script or npm install
2. **Start Services:** Open 7 terminals and run each service
3. **Test APIs:** Use curl commands or Postman collection
4. **Build Frontend:** Create React app to consume these APIs
5. **Deploy:** Use Docker/Kubernetes for production

---

**Ready to build amazing things! 🚀**

For detailed documentation, see: `README.md`
