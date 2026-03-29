const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelUserOrder,
  updateUserOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  deleteOrder,
} = require('../controllers/orderController');

// User routes
router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id', auth, updateUserOrder);
router.put('/:id/cancel', auth, cancelUserOrder);

// Admin routes
router.put('/:id/status', auth, updateOrderStatus);
router.get('/admin/all', auth, getAllOrders);
router.delete('/:id', auth, deleteOrder);

// Service-to-service route
router.put('/payment-status/update', updatePaymentStatus);

module.exports = router;
