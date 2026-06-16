const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      // ✅ Attach user with villageId to req.user
      req.user = {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        villageId: user.villageId,  // ✅ CRITICAL: Village isolation
        village: user.village,
        district: user.district
      };
      
      console.log('✅ Auth middleware - User attached:', {
        id: req.user.id,
        username: req.user.username,
        villageId: req.user.villageId,
        village: req.user.village
      });
      
      next();
    } catch (error) {
      console.error('❌ Token error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role ${req.user.role} not authorized` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };