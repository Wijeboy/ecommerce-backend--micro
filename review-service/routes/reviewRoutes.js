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
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getReviewsByProduct);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);
router.get('/user/my-reviews', auth, getUserReviews);

module.exports = router;
