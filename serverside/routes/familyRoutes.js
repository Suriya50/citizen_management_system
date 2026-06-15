const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createFamily, getFamilies, getFamily, updateFamily, deleteFamily } = require('../controllers/familyController');

router.post('/', protect, createFamily);
router.get('/', protect, getFamilies);
router.get('/:id', protect, getFamily);
router.put('/:id', protect, updateFamily);
router.delete('/:id', protect, deleteFamily);

module.exports = router;