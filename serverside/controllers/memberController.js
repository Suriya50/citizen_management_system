const Member = require('../models/Member');
const Family = require('../models/Family');

// Generate unique citizen ID
const generateCitizenId = async (familyId) => {
  try {
    const lastMember = await Member.findOne({ 
      familyId: familyId, 
      isDeleted: false 
    }).sort({ citizenId: -1 }).limit(1);
    
    if (!lastMember || !lastMember.citizenId) {
      return 'CIT-001';
    }
    
    const match = lastMember.citizenId.match(/\d+/);
    if (!match) return 'CIT-001';
    
    const lastNumber = parseInt(match[0], 10);
    const newNumber = lastNumber + 1;
    return `CIT-${newNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    return `CIT-${Date.now()}`;
  }
};

// Add member
const addMember = async (req, res) => {
  try {
    console.log('=== ADD MEMBER ===');
    const { familyId, name, age, gender, relationToHead, aadharNumber, voterId, mobileNumber, occupation, education, bloodGroup, maritalStatus, disabilities } = req.body;
    
    if (!familyId || !name || !age || !relationToHead) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    
    const citizenId = await generateCitizenId(familyId);
    
    const member = await Member.create({
      citizenId,
      familyId,
      name: name.trim(),
      age: parseInt(age),
      gender,
      relationToHead,
      aadharNumber: aadharNumber || null,
      voterId: voterId || null,
      mobileNumber: mobileNumber || null,
      occupation: occupation || 'Other',
      education: education || 'Other',
      bloodGroup: bloodGroup || '',
      maritalStatus: maritalStatus || 'Single',
      disabilities: disabilities || 'None'
    });
    
    family.totalMembers = (family.totalMembers || 0) + 1;
    await family.save();
    
    res.status(201).json({ success: true, message: 'Member added', data: member });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get family members
const getFamilyMembers = async (req, res) => {
  try {
    const members = await Member.find({ familyId: req.params.familyId, isDeleted: false });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single member
const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('familyId', 'familyId headOfFamily');
    if (!member || member.isDeleted) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member || member.isDeleted) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    
    member.isDeleted = true;
    await member.save();
    
    const family = await Family.findById(member.familyId);
    if (family && family.totalMembers > 0) {
      family.totalMembers -= 1;
      await family.save();
    }
    
    res.status(200).json({ success: true, message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark deceased
const markDeceased = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    
    member.isAlive = false;
    member.deathDate = req.body.deathDate || Date.now();
    await member.save();
    
    const family = await Family.findById(member.familyId);
    if (family && family.totalMembers > 0) {
      family.totalMembers -= 1;
      await family.save();
    }
    
    res.status(200).json({ success: true, message: 'Member marked as deceased' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search members
const searchMembers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    
    const regex = { $regex: q, $options: 'i' };
    const members = await Member.find({
      isDeleted: false,
      $or: [
        { name: regex },
        { aadharNumber: regex },
        { voterId: regex },
        { mobileNumber: regex },
        { citizenId: regex }
      ]
    }).populate('familyId', 'familyId headOfFamily');
    
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ MAKE SURE ALL FUNCTIONS ARE EXPORTED
module.exports = {
  addMember,
  getFamilyMembers,
  getMember,
  updateMember,
  deleteMember,
  markDeceased,
  searchMembers
};