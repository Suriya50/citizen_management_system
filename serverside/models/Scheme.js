const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  eligibility: { type: String, enum: ['BPL', 'APL', 'ALL'], default: 'BPL' },
  benefits: { type: String },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'expired'], default: 'upcoming' },
  beneficiaries: [{ 
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' }, 
    distributedDate: { type: Date, default: Date.now } 
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scheme', schemeSchema);