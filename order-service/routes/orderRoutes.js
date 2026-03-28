const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
} = require('../controllers/orderController');

// User routes
router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrderById);

// Admin routes
router.put('/:id/status', auth, updateOrderStatus);
router.get('/admin/all', auth, getAllOrders);

// Service-to-service route
router.put('/payment-status/update', updatePaymentStatus);

module.exports = router;
