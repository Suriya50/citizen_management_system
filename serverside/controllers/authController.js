const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { username, password, name, village, district, taluk, pincode, mobileNumber, email } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }
    
    const villageId = village.toLowerCase().replace(/ /g, '_') + '_' + Date.now();
    
    const user = await User.create({
      username,
      password,
      name,
      role: 'officer',
      villageId: villageId,
      village,
      district,
      taluk: taluk || '',
      pincode: pincode || '',
      mobileNumber,
      email: email || '',
      isActive: true
    });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        district: user.district
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }
    
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        district: user.district
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ 
      success: true, 
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        district: user.district
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ LOGOUT
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };