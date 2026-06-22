const express = require('express');
const router = express.Router();
const { submitPayment, verifyPayment } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitPayment);
router.post('/verify', protect, admin, verifyPayment);

module.exports = router;