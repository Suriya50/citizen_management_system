const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'officer', 'viewer'], default: 'officer' },
  
  // ✅ villageId - NOT required (will be generated)
  villageId: { type: String, unique: true, sparse: true },
  village: { type: String, required: true },
  district: { type: String, required: true },
  taluk: { type: String },
  pincode: { type: String },
  
  employeeId: { type: String, unique: true, sparse: true },
  mobileNumber: { type: String, required: true, unique: true },
  email: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// ✅ Generate villageId BEFORE validation
userSchema.pre('validate', function(next) {
  if (!this.villageId && this.village) {
    this.villageId = this.village.toLowerCase().replace(/ /g, '_') + '_' + Date.now();
  }
  next();
});

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);