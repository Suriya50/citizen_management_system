const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  addMember,
  getFamilyMembers,
  getMember,
  updateMember,
  deleteMember,
  markDeceased,
  searchMembers
} = require('../controllers/memberController');

// ✅ All routes are protected
router.post('/', protect, addMember);
router.get('/family/:familyId', protect, getFamilyMembers);
router.get('/search', protect, searchMembers);
router.get('/:id', protect, getMember);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, deleteMember);
router.put('/:id/deceased', protect, markDeceased);

module.exports = router;