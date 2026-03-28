const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  register,
  registerAdmin,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Admin routes
router.get('/', adminAuth, getAllUsers);
router.get('/:id', getUserById); // For service-to-service calls

module.exports = router;
