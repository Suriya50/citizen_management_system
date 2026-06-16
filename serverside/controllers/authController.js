const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register new user
const register = async (req, res) => {
  try {
    console.log('📝 Registration attempt STARTED');
    console.log('Request body:', req.body);
    
    const { username, password, name, village, district, taluk, pincode, mobileNumber, email } = req.body;
    
    // ✅ Check all required fields
    console.log('Checking required fields...');
    if (!username) {
      console.log('❌ Username missing');
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
    if (!password) {
      console.log('❌ Password missing');
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    if (!name) {
      console.log('❌ Name missing');
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!village) {
      console.log('❌ Village missing');
      return res.status(400).json({ success: false, message: 'Village is required' });
    }
    if (!district) {
      console.log('❌ District missing');
      return res.status(400).json({ success: false, message: 'District is required' });
    }
    if (!mobileNumber) {
      console.log('❌ Mobile number missing');
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    
    console.log('✅ All required fields present');
    
    // ✅ Check if user already exists
    console.log('Checking for existing username...');
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }
    
    // ✅ Check if mobile number already exists
    console.log('Checking for existing mobile...');
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile) {
      console.log('❌ Mobile already exists:', mobileNumber);
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number already registered' 
      });
    }
    
    // ✅ Generate villageId
    console.log('Generating villageId...');
    const villageId = village.toLowerCase().replace(/ /g, '_') + '_' + Date.now();
    console.log('✅ Generated Village ID:', villageId);
    
    // ✅ Create user
    console.log('Creating user...');
    const user = new User({
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
    
    console.log('User object created:', user);
    
    // ✅ Save user
    console.log('Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully:', user._id);
    
    // Generate token
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
    console.error('❌❌❌ REGISTRATION ERROR ❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error keyPattern:', error.keyPattern);
    
    // ✅ Handle duplicate key errors
    if (error.code === 11000) {
      console.log('❌ Duplicate key error');
      if (error.keyPattern?.username) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already exists' 
        });
      }
      if (error.keyPattern?.mobileNumber) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mobile number already registered' 
        });
      }
      if (error.keyPattern?.villageId) {
        return res.status(400).json({ 
          success: false, 
          message: 'This village is already registered' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate entry. Please check your details.' 
      });
    }
    
    // ✅ Handle validation errors
    if (error.name === 'ValidationError') {
      console.log('❌ Validation error');
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    // ✅ Unknown error
    console.log('❌ Unknown error');
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during registration' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.username);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    if (!user.isActive) {
      console.log('❌ User inactive:', username);
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    }
    
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
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
        villageId: user.villageId,
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

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const getVillages = async (req, res) => {
  try {
    const villages = await User.find({ isActive: true }).select('village villageId district');
    res.json({ success: true, villages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, logout, getVillages };