const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReportStats, exportReport } = require('../controllers/reportController');

router.get('/stats', protect, getReportStats);
router.get('/export/families', protect, exportReport);

module.exports = router;