const Review = require('../models/Review');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, userName } = req.body;

    // Validation
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.userId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      productId,
      userId: req.userId,
      userName: userName || 'Anonymous',
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reviews by Product ID
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Review (Owner only)
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check authorization
    if (review.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment;
    }

    await review.save();
    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Review (Owner or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check authorization
    if (review.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Reviews (Admin)
exports.getAllReviews = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Reviews
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
