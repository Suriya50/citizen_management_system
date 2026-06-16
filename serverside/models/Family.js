const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  familyId: { type: String, required: true, unique: true },
  
  // ✅ ADD THIS - Village isolation field
  villageId: { type: String, required: true, index: true },
  
  headOfFamily: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    area: { type: String },
    pincode: { type: String }
  },
  totalMembers: { type: Number, default: 0 },
  bplCardNumber: { type: String, unique: true, sparse: true },
  economicStatus: { type: String, enum: ['BPL', 'APL'], default: 'BPL' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});

// ✅ Add compound index for villageId + familyId
familySchema.index({ villageId: 1, familyId: 1 }, { unique: true });

familySchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Family', familySchema);