const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  initiatePayment,
  confirmPayment,
  getPaymentByOrderId,
  getUserPayments,
  failPayment,
} = require('../controllers/paymentController');

// Protected routes
router.post('/initiate', auth, initiatePayment);
router.post('/confirm', auth, confirmPayment);
router.post('/fail', auth, failPayment);
router.get('/user', auth, getUserPayments);

router.get('/:orderId', auth, getPaymentByOrderId);

module.exports = router;
