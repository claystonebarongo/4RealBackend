const express = require('express');
const router = express.Router();
const {
    logInspection,
    getUserHistory,
    scheduleInspection,
    getPendingInspections,
    cancelInspection // Import the new controller function
} = require('../controllers/inspectionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin: Get all pending inspections to display in the dashboard
router.get('/pending', protect, admin, getPendingInspections);

// Admin: Schedule an existing inspection request by ID
router.patch('/:id/schedule', protect, admin, scheduleInspection);

// Admin: Cancel an existing inspection request by ID
router.patch('/:id/cancel', protect, admin, cancelInspection);

// Admin: Log a completed service
router.post('/log', protect, admin, logInspection);

// User/Admin: Fetch user history
router.get('/history/:userId', protect, getUserHistory);

module.exports = router;