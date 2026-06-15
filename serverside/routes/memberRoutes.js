const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addMember,
  getFamilyMembers,
  getMember,
  updateMember,
  deleteMember,
  markDeceased,
  searchMembers
} = require('../controllers/memberController');

// Search route - MUST be before /:id route
router.get('/search', protect, searchMembers);

// Member CRUD routes
router.post('/', protect, addMember);
router.get('/family/:familyId', protect, getFamilyMembers);
router.get('/:id', protect, getMember);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, deleteMember);
router.post('/:id/deceased', protect, markDeceased);

module.exports = router;