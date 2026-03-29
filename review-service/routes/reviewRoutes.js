const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createReview,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
  getAllReviews,
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getReviewsByProduct);

// Protected routes
router.post('/', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);
router.get('/user/my-reviews', auth, getUserReviews);
router.get('/admin/all', auth, getAllReviews);

// Public route by id should come last to avoid shadowing specific paths
router.get('/:id', getReviewById);

module.exports = router;
