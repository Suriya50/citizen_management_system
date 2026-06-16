const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  citizenId: { type: String, required: true },  // ✅ REMOVED unique: true
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  relationToHead: { type: String, required: true },
  aadharNumber: { type: String, default: null, unique: true, sparse: true },  // ✅ Keep unique
  voterId: { type: String, default: null, unique: true, sparse: true },  // ✅ Keep unique
  mobileNumber: { type: String, default: null },
  occupation: { type: String, default: 'Other' },
  education: { type: String, default: 'Other' },
  bloodGroup: { type: String, default: '' },
  maritalStatus: { type: String, default: 'Single' },
  disabilities: { type: String, default: 'None' },
  isAlive: { type: Boolean, default: true },
  deathDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false }
});

// ✅ ADD THIS LINE - Critical fix!
memberSchema.index({ familyId: 1, citizenId: 1 }, { unique: true });

memberSchema.pre('save', function(next) { 
  this.updatedAt = Date.now(); 
  next(); 
});

module.exports = mongoose.model('Member', memberSchema);