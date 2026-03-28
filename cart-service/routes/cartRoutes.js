const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require('../controllers/cartController');

// Protected routes
router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.put('/update', auth, updateQuantity);
router.delete('/remove', auth, removeItem);
router.delete('/clear', auth, clearCart);

module.exports = router;
