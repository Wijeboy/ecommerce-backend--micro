# 🕸️ Swagger API Documentation Guide

## What is Swagger?

Swagger (OpenAPI) provides interactive API documentation that lets you:
- ✅ See all available endpoints
- ✅ View request/response formats
- ✅ Test APIs directly from the browser
- ✅ Generate code snippets
- ✅ No Postman needed!

---

## 🚀 Accessing Swagger UI

Once all services are running, open in your browser:

```
http://localhost:3000/api-docs
```

You should see a beautiful interactive interface with all endpoints documented.

---

## 📖 How to Use Swagger UI

### 1. **Browse Endpoints**
- All endpoints are organized by tags (Users, Products, Cart, etc.)
- Click on any tag to expand/collapse it
- Click on any endpoint to see details

### 2. **Test an Endpoint**
```
1. Click on the endpoint you want to test
2. Click the "Try it out" button
3. Fill in any required parameters
4. Click "Execute"
5. See the response immediately
```

### 3. **Authenticate (for protected endpoints)**
```
1. Look for the lock icon 🔒
2. Click "Authorize" at the top right
3. Paste your JWT token
4. Click "Authorize"
5. Now test protected endpoints
```

---

## 📝 Example: Complete User Journey in Swagger

### Step 1: Register User
```
1. Find: POST /api/users/register
2. Click "Try it out"
3. Fill body:
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
4. Click "Execute"
5. Copy the token from response
```

### Step 2: Authorize with Token
```
1. Click "Authorize" button (top right)
2. Paste token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
3. Click "Authorize"
4. Close the dialog
```

### Step 3: Create Product (as Admin)
```
⚠️  First create an admin user or manually set roles in MongoDB
```

### Step 4: Browse Products
```
1. Find: GET /api/products
2. Click "Try it out"
3. Click "Execute"
4. See all products in response
```

### Step 5: Add to Cart
```
1. Find: POST /api/cart/add
2. Click "Try it out"
3. Fill body with product details:
   {
     "productId": "product-id-from-step-4",
     "title": "Product Name",
     "price": 99.99,
     "quantity": 1
   }
4. Click "Execute"
5. Cart item added successfully
```

### Step 6: Create Order
```
1. Find: POST /api/orders
2. Click "Try it out"
3. Fill body:
   {
     "items": [
       {
         "productId": "product-id",
         "title": "Product Name",
         "price": 99.99,
         "quantity": 1
       }
     ],
     "shippingAddress": "123 Main St, City, Country",
     "totalAmount": 99.99
   }
4. Click "Execute"
5. Order created with cart auto-cleared
```

### Step 7: Process Payment
```
1. Find: POST /api/payments/initiate
2. Click "Try it out"
3. Fill body:
   {
     "orderId": "order-id-from-step-6",
     "amount": 99.99,
     "method": "credit_card"
   }
4. Click "Execute"
```

### Step 8: Confirm Payment
```
1. Find: POST /api/payments/confirm
2. Click "Try it out"
3. Fill body:
   {
     "orderId": "order-id"
   }
4. Click "Execute"
5. Payment confirmed!
```

### Step 9: Add Review
```
1. Find: POST /api/reviews
2. Click "Try it out"
3. Fill body:
   {
     "productId": "product-id",
     "rating": 5,
     "comment": "Excellent product!",
     "userName": "John Doe"
   }
4. Click "Execute"
5. Review added!
```

---

## 🔑 Important: JWT Authorization

### Getting Your Token

**Option 1: Register New User**
```
POST /api/users/register
{
  "name": "Your Name",
  "email": "your@email.com",
  "password": "password123"
}
```
Response contains: `"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

**Option 2: Login**
```
POST /api/users/login
{
  "email": "your@email.com",
  "password": "password123"
}
```

### Using Token in Swagger

1. Click **"Authorize"** button (top-right corner)
2. In the dialog, paste your token in the **"value"** field:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YWJjMTIzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDYwNDgwMH0.abc123...
   ```
3. Click **"Authorize"**
4. Close the dialog
5. Now all 🔒 protected endpoints will work

---

## 📊 API Endpoint Categories

### Public Endpoints (No token needed)
✅ GET /api/products
✅ GET /api/products/{id}
✅ GET /api/reviews/product/{productId}
✅ GET /api/reviews/{id}
✅ POST /api/users/register
✅ POST /api/users/login

### Protected Endpoints (Token required) 🔒
✅ GET /api/users/profile
✅ PUT /api/users/profile
✅ GET /api/cart
✅ POST /api/cart/add
✅ PUT /api/cart/update
✅ DELETE /api/cart/remove
✅ DELETE /api/cart/clear
✅ POST /api/orders
✅ GET /api/orders
✅ GET /api/orders/{id}
✅ POST /api/reviews
✅ PUT /api/reviews/{id}
✅ DELETE /api/reviews/{id}

### Admin Endpoints (Token + admin role required) 👨‍💼
✅ POST /api/products
✅ PUT /api/products/{id}
✅ DELETE /api/products/{id}
✅ GET /api/users
✅ PUT /api/orders/{id}/status

---

## 🐛 Common Issues & Solutions

### Issue: "401 Unauthorized"
**Solution:** 
- You need to authorize first (see "Using Token in Swagger" above)
- Make sure token is valid and not expired

### Issue: "403 Forbidden"
**Solution:**
- You're trying to access an admin endpoint
- Create an admin user or use postman to manually set role

### Issue: "Can't see Swagger UI"
**Solution:**
- Make sure API Gateway is running on port 3000
- Run: `cd api-gateway && npm run dev`
- Check npm packages are installed: `npm install`

### Issue: "Endpoint returns error"
**Solution:**
- Check response message for details
- Verify all required fields are filled
- Check MongoDB connection is working

---

## 🎯 REST Principles in Swagger

Understanding HTTP methods shown in Swagger:

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Retrieve data | GET /api/products |
| **POST** | Create data | POST /api/orders |
| **PUT** | Update data | PUT /api/cart/update |
| **DELETE** | Remove data | DELETE /api/cart/remove |

---

## 💡 Pro Tips

### Tip 1: Use Parameters Effectively
```
GET /api/products?search=laptop&category=Electronics
- Uses query parameters for filtering
- See in Swagger: "Parameters" section
```

### Tip 2: Check Request/Response Schemas
```
Every endpoint in Swagger shows:
- Request body schema
- Response schema
- Possible status codes
- Error descriptions
```

### Tip 3: Try Different Status Codes
```
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
```

### Tip 4: Download Response
```
Click the download icon in response to save JSON
Useful for testing data structures
```

---

## 📚 HTTP Status Codes

| Code | Meaning | When to See |
|------|---------|-----------|
| **200** | OK | Successful GET/PUT |
| **201** | Created | Successful POST |
| **400** | Bad Request | Missing required fields |
| **401** | Unauthorized | No token or invalid token |
| **403** | Forbidden | Not admin when required |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Service error |

---

## 🔄 Complete Test Workflow

```
1. Register User (POST /api/users/register)
   ↓ Get Token
2. Authorize in Swagger (click Authorize button)
   ↓ Token set globally
3. Browse Products (GET /api/products)
   ↓ Get Product ID
4. Add to Cart (POST /api/cart/add)
   ↓ Added to cart
5. Create Order (POST /api/orders)
   ↓ Order created, cart cleared
6. Process Payment (POST /api/payments/initiate → confirm)
   ↓ Payment processed
7. Add Review (POST /api/reviews)
   ↓ Review added
8. View All Reviews (GET /api/reviews/product/{productId})
   ↓ See all reviews including yours
```

---

## 📞 Need More Help?

- Check README.md for architecture details
- Check API_REFERENCE.md for quick endpoint lookup
- Check service-specific documentation
- Service health: http://localhost:PORT/health

---

## 🎉 You're Ready!

Start testing your APIs in Swagger:
**http://localhost:3000/api-docs**

Happy testing! 🚀
