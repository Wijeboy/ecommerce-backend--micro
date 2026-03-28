const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Microservices API',
      version: '1.0.0',
      description: 'API Gateway for E-Commerce Microservices',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
    },
  },
  apis: ['./swagger-docs.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
  customCss: '.swagger-ui { max-width: 1200px; margin: 0 auto; }',
  customSiteTitle: 'E-Commerce API Documentation',
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running', timestamp: new Date() });
});

// User Service Routes
app.use(
  '/api/users',
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/users',
    },
  })
);

// Product Service Routes
app.use(
  '/api/products',
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/products': '/api/products',
    },
  })
);

// Cart Service Routes
app.use(
  '/api/cart',
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/cart': '/api/cart',
    },
  })
);

// Order Service Routes
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/orders': '/api/orders',
    },
  })
);

// Payment Service Routes
app.use(
  '/api/payments',
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/payments': '/api/payments',
    },
  })
);

// Review Service Routes
app.use(
  '/api/reviews',
  createProxyMiddleware({
    target: process.env.REVIEW_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/reviews': '/api/reviews',
    },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs\n`);
  console.log(`Connected to Microservices:`);
  console.log(`  ✓ User Service: ${process.env.USER_SERVICE_URL}`);
  console.log(`  ✓ Product Service: ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`  ✓ Cart Service: ${process.env.CART_SERVICE_URL}`);
  console.log(`  ✓ Order Service: ${process.env.ORDER_SERVICE_URL}`);
  console.log(`  ✓ Payment Service: ${process.env.PAYMENT_SERVICE_URL}`);
  console.log(`  ✓ Review Service: ${process.env.REVIEW_SERVICE_URL}\n`);
});

module.exports = app;
