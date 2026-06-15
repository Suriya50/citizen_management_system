const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  citizenId: { type: String, required: true, unique: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  relationToHead: { type: String, required: true },
  // Government ID Documents
  aadharNumber: { type: String, default: null, sparse: true },
  voterId: { type: String, default: null, sparse: true },
  // Contact
  mobileNumber: { type: String, default: null },
  // Personal Details
  occupation: { type: String, default: 'Other' },
  education: { type: String, default: 'Other' },
  bloodGroup: { type: String, default: '' },
  maritalStatus: { type: String, default: 'Single' },
  disabilities: { type: String, default: 'None' },
  // Lifecycle
  isAlive: { type: Boolean, default: true },
  deathDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false }
});

memberSchema.pre('save', function(next) { 
  this.updatedAt = Date.now(); 
  next(); 
});

module.exports = mongoose.model('Member', memberSchema);