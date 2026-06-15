const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getVillages } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/villages', protect, getVillages);

module.exports = router;