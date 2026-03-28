# 🚀 Final Deployment Checklist

## ✅ Step-by-Step Setup Instructions

### Before Starting: Requirements
- ✅ Node.js v14+ installed
- ✅ npm installed
- ✅ Internet connection (for MongoDB Atlas)
- ✅ 7 terminal windows available

---

## 🔧 Phase 1: Installation (Run Once)

### Step 1.1: Navigate to Project
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro
```

### Step 1.2: Run Setup Script
```bash
chmod +x SETUP.sh
./SETUP.sh
```

**What it does:**
- Installs npm packages for all 7 services
- Takes about 2-3 minutes

**Expected output:**
```
Installing dependencies for api-gateway...
✓ api-gateway dependencies installed

Installing dependencies for user-service...
✓ user-service dependencies installed

[... continues for all services ...]

All dependencies installed successfully!
```

---

## 🎯 Phase 2: Start All Services

### Step 2.1: Open 7 Terminals
You need 7 separate terminal windows. You can:
- Use VS Code: Split terminals
- Use iTerm: Create new tabs
- Use macOS Terminal: Cmd+T for new tabs

### Step 2.2: Start Services

**Terminal 1 - API Gateway (Port 3000)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/api-gateway
npm run dev
```

**Expected output:**
```
> api-gateway@1.0.0 dev
> nodemon server.js

[nodemon] starting `node server.js`

🚀 API Gateway running on http://localhost:3000
📚 Swagger UI available at http://localhost:3000/api-docs

Connected to Microservices:
  ✓ User Service: http://localhost:5001
  ✓ Product Service: http://localhost:5002
  ✓ Cart Service: http://localhost:5003
  ✓ Order Service: http://localhost:5004
  ✓ Payment Service: http://localhost:5005
  ✓ Review Service: http://localhost:5006
```

**Terminal 2 - User Service (Port 5001)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/user-service
npm run dev
```

**Expected output:**
```
User Service: MongoDB connected
User Service running on port 5001
```

**Terminal 3 - Product Service (Port 5002)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/product-service
npm run dev
```

**Terminal 4 - Cart Service (Port 5003)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/cart-service
npm run dev
```

**Terminal 5 - Order Service (Port 5004)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/order-service
npm run dev
```

**Terminal 6 - Payment Service (Port 5005)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/payment-service
npm run dev
```

**Terminal 7 - Review Service (Port 5006)**
```bash
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro/review-service
npm run dev
```

---

## ✅ Phase 3: Verify Everything Works

### Step 3.1: Run Verification Script
```bash
# Open a new terminal (Terminal 8)
cd /Users/pramodwijenayake/Desktop/ecommerce-backend--micro
chmod +x verify-services.sh
./verify-services.sh
```

**Expected output:**
```
========================================
E-Commerce Microservices - Health Check
========================================

Testing Health Endpoints...

Testing API Gateway (port 3000)... ✓ OK (HTTP 200)
Testing User Service (port 5001)... ✓ OK (HTTP 200)
Testing Product Service (port 5002)... ✓ OK (HTTP 200)
Testing Cart Service (port 5003)... ✓ OK (HTTP 200)
Testing Order Service (port 5004)... ✓ OK (HTTP 200)
Testing Payment Service (port 5005)... ✓ OK (HTTP 200)
Testing Review Service (port 5006)... ✓ OK (HTTP 200)

========================================
Results: 7 passed, 0 failed
========================================

✓ All services are running!

Next Steps:
1. Open Swagger UI: http://localhost:3000/api-docs
2. Test API endpoints from the Swagger interface
3. Start with: Register User → Create Product → Add to Cart → Create Order
```

### Step 3.2: Access Swagger UI
Open in your browser:
```
http://localhost:3000/api-docs
```

You should see:
- Beautiful Swagger interface
- All endpoints organized by tags
- "Try it out" buttons on each endpoint
- Authorization support

---

## 🕸️ Phase 4: Test with Swagger UI

### Step 4.1: Register a User
1. Open http://localhost:3000/api-docs
2. Find: **POST /api/users/register**
3. Click to expand
4. Click "Try it out"
5. Fill in body:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```
6. Click "Execute"
7. **Copy the token from response**

### Step 4.2: Authorize with Token
1. Click "Authorize" button (top-right)
2. Paste your token in the text field
3. Click "Authorize"
4. Close the dialog

### Step 4.3: Test Protected Endpoints
Now try:
- **GET /api/users/profile** - Should return your profile
- **GET /api/cart** - Should return your cart (empty)

### Step 4.4: Complete Test Flow
```
1. GET /api/products
   → See list of products

2. POST /api/products (admin)
   → Create a test product

3. POST /api/cart/add
   → Add product to cart

4. GET /api/cart
   → Verify item in cart

5. POST /api/orders
   → Create order from cart

6. POST /api/payments/initiate
   → Start payment

7. POST /api/payments/confirm
   → Complete payment

8. POST /api/reviews
   → Add review for product

9. GET /api/reviews/product/{productId}
   → See reviews including yours
```

---

## 🚨 Troubleshooting

### Problem: "Cannot find module 'express'"
**Solution:**
```bash
cd api-gateway
npm install
# Repeat for other services
```

### Problem: "Port 3000 already in use"
**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000
# Kill it (replace 123 with actual PID)
kill -9 123
```

### Problem: "MongoDB connection error"
**Solution:**
1. Check internet connection
2. Verify IP is whitelisted in MongoDB Atlas
3. Check credentials: `mongodb+srv://user:user1@cluster0.v0dwt8o.mongodb.net`

### Problem: "Swagger UI shows blank or errors"
**Solution:**
1. Make sure all services are running
2. Check browser console for errors
3. Clear browser cache and reload
4. Try incognito/private window

### Problem: "Authorization not working"
**Solution:**
1. Register first: POST /api/users/register
2. Copy token from response
3. Click "Authorize" button carefully
4. Paste complete token (without quotes)
5. Click "Authorize" button again

### Problem: "Creating product returns 403 Forbidden"
**Solution:**
- Create product endpoint is admin-only
- Regular users can only view products
- Skip product creation or mark user as admin in MongoDB

---

## 📊 Quick Health Check Commands

### Check Individual Services
```bash
curl http://localhost:3000/health  # API Gateway
curl http://localhost:5001/health  # User Service
curl http://localhost:5002/health  # Product Service
curl http://localhost:5003/health  # Cart Service
curl http://localhost:5004/health  # Order Service
curl http://localhost:5005/health  # Payment Service
curl http://localhost:5006/health  # Review Service
```

### Check with All Services in One Script
```bash
./verify-services.sh
```

---

## 📷 Screenshots You Should See

### Terminal 1 (API Gateway)
```
🚀 API Gateway running on http://localhost:3000
📚 Swagger UI available at http://localhost:3000/api-docs

Connected to Microservices:
  ✓ User Service: http://localhost:5001
  ✓ Product Service: http://localhost:5002
  ✓ Cart Service: http://localhost:5003
  ✓ Order Service: http://localhost:5004
  ✓ Payment Service: http://localhost:5005
  ✓ Review Service: http://localhost:5006
```

### Browser (Swagger UI)
```
URL: http://localhost:3000/api-docs

Visual: 
- White/blue Swagger interface
- "Authorize" button in top right
- Tags: Users, Products, Cart, Orders, Payments, Reviews
- Each tag expandable with endpoints
- Green "Try it out" buttons on each endpoint
```

### Verification Script
```
✓ All services are running!

Next Steps:
1. Open Swagger UI: http://localhost:3000/api-docs
2. Test API endpoints from the Swagger interface
3. Start with: Register User → Create Product → Add to Cart
```

---

## 📋 Final Checklist Before Demo

- [ ] Run SETUP.sh successfully
- [ ] All 7 services started in separate terminals
- [ ] verify-services.sh shows 7/7 passed
- [ ] Swagger UI opens at http://localhost:3000/api-docs
- [ ] POST /api/users/register works
- [ ] Authorization works with token
- [ ] GET /api/users/profile returns user data
- [ ] GET /api/products works
- [ ] POST /api/cart/add works
- [ ] Full user journey completes successfully

---

## 🎯 What to Tell Your Team

> **Great news! Setup is complete:**
>
> ✅ **Port:** Changed from 5000 to 3000 (macOS compatible)
> ✅ **Swagger UI:** Ready at http://localhost:3000/api-docs
> ✅ **All Services:** User, Product, Cart, Order, Payment, Review
> ✅ **Documentation:** Complete with examples
> ✅ **Verification:** Script available to test all services
>
> **To get started:**
> 1. Run ./SETUP.sh (installs dependencies)
> 2. Start 7 services in separate terminals
> 3. Run ./verify-services.sh (verify all are working)
> 4. Open http://localhost:3000/api-docs
> 5. Test endpoints directly from Swagger UI
>
> **Features:**
> - No Postman needed for testing
> - Beautiful interactive interface
> - All endpoints fully documented
> - JWT authentication supported
> - Click "Try it out" to test directly

---

## 📞 Support Resources

- **SETUP_SUMMARY.md** - Complete summary of all changes
- **QUICK_START.md** - Step-by-step setup guide
- **SWAGGER_GUIDE.md** - How to use Swagger UI
- **API_REFERENCE.md** - Quick endpoint lookup
- **README.md** - Full architecture documentation
- **verify-services.sh** - Health check script

---

## ⏱️ Expected Timeline

| Step | Duration | Notes |
|------|----------|-------|
| SETUP.sh | 2-3 min | One-time only |
| Start all services | 10 sec | 7 terminals |
| verify-services.sh | 5 sec | Health check |
| Register user in Swagger | 10 sec | Get token |
| Complete test flow | 2-3 min | All endpoints |
| **Total** | **~10 minutes** | First-time setup |

---

**Last Updated:** March 28, 2026  
**Version:** 1.1.0  
**Status:** ✅ Ready for Team
