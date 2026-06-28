const express = require('express');
const router = express.Router();
const {
    submitPayment,
    verifyPayment,
    getPendingPayments
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// User: Submit a new payment
router.post('/submit', protect, submitPayment);

// Admin: Get all payments pending verification
router.get('/pending', protect, admin, getPendingPayments);

// Admin: Verify an existing payment by ID
router.patch('/:paymentId/verify', protect, admin, verifyPayment);

module.exports = router;