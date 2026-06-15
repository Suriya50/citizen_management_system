const Scheme = require('../models/Scheme');
const Family = require('../models/Family');

const getSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const distributeScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    
    let query = { isDeleted: false };
    if (scheme.eligibility === 'BPL') query.economicStatus = 'BPL';
    if (scheme.eligibility === 'APL') query.economicStatus = 'APL';
    
    const eligible = await Family.find(query);
    scheme.beneficiaries = eligible.map(f => ({ familyId: f._id }));
    scheme.status = 'expired';
    await scheme.save();
    
    res.json({ message: `Distributed to ${eligible.length} families`, count: eligible.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSchemes, createScheme, distributeScheme };