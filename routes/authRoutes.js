const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import your auth middleware

// Debug log to verify the controller is importing correctly
console.log("IMPORTED CONTROLLER:", authController);

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// NEW: Protected route to fetch the authenticated user's profile
router.get('/profile', protect, authController.getProfile);

// Admin route to fetch all members
router.get('/members', authController.getAllUsers);

module.exports = router;