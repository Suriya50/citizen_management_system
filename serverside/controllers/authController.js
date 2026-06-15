const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, password, name, village, district, taluk, pincode, mobileNumber, email } = req.body;
    
    console.log('📝 Registration attempt:', username);
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists. Please choose another.' 
      });
    }
    
    // Check if mobile number already exists
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number already registered.' 
      });
    }
    
    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      username,
      password,
      name,
      role: 'officer',
      village,
      district,
      taluk: taluk || '',
      pincode: pincode || '',
      mobileNumber,
      email: email || '',
      isActive: true
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    console.log('✅ User registered successfully:', username);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        village: user.village,
        district: user.district
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Login attempt:', username);
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    
    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }
    
    // Verify password
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    console.log('✅ Login successful:', username);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        village: user.village,
        district: user.district
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// Get all villages (for admin)
const getVillages = async (req, res) => {
  try {
    const villages = await User.find({ isActive: true }).distinct('village');
    res.json({ success: true, villages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, logout, getVillages };