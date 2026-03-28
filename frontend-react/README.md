# Ecommerce Microservices Frontend (React + Tailwind)

This frontend is built for your 6-service backend through API Gateway only.

## API Gateway Only

All requests use:

VITE_API_BASE_URL=http://localhost:3000

No page calls direct microservice ports.

## Run

1. Install dependencies

npm install

2. Start dev server

npm run dev

3. Build

npm run build

## Service to Page Mapping

- Product Service:
	- Home page product listing (`/`)
	- Product detail page (`/products/:id`)
- Review Service:
	- Reviews shown on product detail page
	- Add review from product detail page
- User Service:
	- Login (`/login`)
	- Register (`/register`)
	- Admin Register with secret (`/register`)
	- Profile (`/profile`)
- Cart Service:
	- Cart page (`/cart`) with add/update/remove/clear and total
- Order Service:
	- Checkout page creates order (`/checkout`)
	- Order history page (`/orders`)
- Payment Service:
	- Checkout page initiates + confirms payment and updates status

## Navigation

Top navbar links:

- Home
- Cart
- Orders
- Profile
- Admin (for admin role)
- Login/Register (when logged out)

## Admin Coverage

Admin dashboard route: `/admin` (admin-only)

Included admin functions:

- Get all users
- Product create
- Product update
- Product delete
- Product listing + edit prefill
- Get all orders
- Update order status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
- KPI stats cards (users, admins, products, orders, pending, paid)
- Search + pagination for users/orders/products
- Toast notifications for all admin actions

## State Management

- Auth token and user: Context + localStorage
- Cart state: Context synced with backend cart service

## Folder Structure

frontend-react/
- src/
	- components/
		- Layout.jsx
		- ProtectedRoute.jsx
	- context/
		- AuthContext.jsx
		- CartContext.jsx
	- pages/
		- HomePage.jsx
		- ProductDetailPage.jsx
		- LoginPage.jsx
		- RegisterPage.jsx
		- ProfilePage.jsx
		- CartPage.jsx
		- CheckoutPage.jsx
		- OrderHistoryPage.jsx
	- services/
		- api.js
	- App.jsx
	- main.jsx
	- index.css
- tailwind.config.js
- postcss.config.js
- .env.example
