const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/familyController');

// ✅ Protected route with village isolation
router.get('/stats', protect, getDashboardStats);

module.exports = router;