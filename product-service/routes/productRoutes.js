const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByIds,
  reduceStock,
} = require('../controllers/productController');

// Public routes
router.get('/', getAllProducts);
router.post('/stock/reduce', reduceStock); // For service-to-service stock updates
router.get('/:id', getProductById);
router.post('/bulk/ids', getProductsByIds); // For service-to-service

// Admin routes
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);

module.exports = router;
