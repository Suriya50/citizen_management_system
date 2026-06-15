const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSchemes, createScheme, distributeScheme } = require('../controllers/schemeController');

router.get('/', protect, getSchemes);
router.post('/', protect, authorize('admin'), createScheme);
router.post('/:id/distribute', protect, distributeScheme);

module.exports = router;