const express = require('express');
const router = express.Router();
const { logInspection, getUserHistory, scheduleInspection } = require('../controllers/inspectionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/schedule', protect, admin, scheduleInspection);
router.post('/log', protect, admin, logInspection);
router.get('/history/:userId', protect, getUserHistory);

module.exports = router;