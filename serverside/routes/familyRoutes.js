const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createFamily,
  getFamilies,
  getFamily,
  updateFamily,
  deleteFamily,
  getRecentFamilies,
  getDashboardStats
} = require('../controllers/familyController');

// ✅ All routes are protected and use villageId from user
router.post('/', protect, createFamily);
router.get('/', protect, getFamilies);
router.get('/stats', protect, getDashboardStats);
router.get('/recent', protect, getRecentFamilies);
router.get('/:id', protect, getFamily);
router.put('/:id', protect, updateFamily);
router.delete('/:id', protect, deleteFamily);

module.exports = router;