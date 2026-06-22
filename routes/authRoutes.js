const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Debug log to verify the controller is importing correctly
console.log("IMPORTED CONTROLLER:", authController);

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// NEW: Admin route to fetch all members
router.get('/members', authController.getAllUsers);

module.exports = router;