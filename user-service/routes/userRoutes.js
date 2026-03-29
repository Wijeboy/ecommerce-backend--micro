const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  register,
  registerAdmin,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.delete('/profile', auth, deleteProfile);

// Admin routes
router.get('/', adminAuth, getAllUsers);
router.put('/:id', adminAuth, updateUserById);
router.delete('/:id', adminAuth, deleteUserById);
router.get('/:id', auth, getUserById);

module.exports = router;
