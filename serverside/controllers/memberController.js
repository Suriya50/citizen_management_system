const Member = require('../models/Member');
const Family = require('../models/Family');

// Generate unique citizen ID per family
const generateCitizenId = async (familyId, villageId) => {
  try {
    console.log(`🔍 Generating citizenId for family: ${familyId}, village: ${villageId}`);
    
    const lastMember = await Member.findOne({ 
      familyId: familyId, 
      villageId: villageId,
      isDeleted: false 
    }).sort({ citizenId: -1 });
    
    if (!lastMember || !lastMember.citizenId) {
      console.log('📌 No existing members, returning CIT-001');
      return 'CIT-001';
    }
    
    const match = lastMember.citizenId.match(/CIT-(\d+)/);
    if (!match) {
      console.log('⚠️ No match found, returning CIT-001');
      return 'CIT-001';
    }
    
    const lastNumber = parseInt(match[1], 10);
    const newNumber = lastNumber + 1;
    const newCitizenId = `CIT-${newNumber.toString().padStart(3, '0')}`;
    console.log(`✅ Generated citizenId: ${newCitizenId}`);
    return newCitizenId;
  } catch (error) {
    console.error('❌ Error generating citizenId:', error);
    return `CIT-${Date.now()}`;
  }
};

// Add member
const addMember = async (req, res) => {
  try {
    console.log('=== ADD MEMBER API CALLED ===');
    
    const { 
      familyId, 
      name, 
      age, 
      gender, 
      relationToHead, 
      aadharNumber, 
      voterId, 
      mobileNumber, 
      occupation, 
      education, 
      bloodGroup, 
      maritalStatus, 
      disabilities 
    } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }
    
    // ✅ Get villageId from user
    const villageId = req.user.villageId;
    
    if (!villageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Village ID is required.' 
      });
    }
    
    console.log(`📍 Village ID: ${villageId}`);
    
    if (!familyId || !name || !age || !relationToHead) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing' 
      });
    }
    
    // ✅ Check family exists AND belongs to this village
    const family = await Family.findOne({ 
      _id: familyId, 
      villageId: villageId,
      isDeleted: false 
    });
    
    if (!family) {
      return res.status(404).json({ 
        success: false, 
        message: 'Family not found in your village' 
      });
    }
    
    const citizenId = await generateCitizenId(familyId, villageId);
    
    const memberData = {
      citizenId,
      familyId,
      villageId: villageId,
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
      disabilities: disabilities || 'None',
      createdBy: req.user.id
    };
    
    const member = await Member.create(memberData);
    
    family.totalMembers = (family.totalMembers || 0) + 1;
    await family.save();
    
    console.log(`✅ Member added: ${citizenId}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Member added successfully', 
      data: member 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 11000) {
      if (error.keyPattern?.aadharNumber) {
        return res.status(400).json({ 
          success: false, 
          message: 'Aadhar number already exists in your village' 
        });
      }
      if (error.keyPattern?.voterId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Voter ID already exists in your village' 
        });
      }
      if (error.keyPattern?.citizenId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Citizen ID conflict. Please try again.' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
};

// Get family members - FILTER BY VILLAGE
const getFamilyMembers = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    const members = await Member.find({ 
      familyId: req.params.familyId, 
      villageId: villageId,
      isDeleted: false 
    });
    console.log(`📊 Found ${members.length} members`);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single member - FILTER BY VILLAGE
const getMember = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    const member = await Member.findOne({ 
      _id: req.params.id, 
      villageId: villageId,
      isDeleted: false 
    }).populate('familyId', 'familyId headOfFamily');
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in your village' });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update member - FILTER BY VILLAGE
const updateMember = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    const member = await Member.findOne({ 
      _id: req.params.id, 
      villageId: villageId,
      isDeleted: false 
    });
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in your village' });
    }
    
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete member - FILTER BY VILLAGE
const deleteMember = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    const member = await Member.findOne({ 
      _id: req.params.id, 
      villageId: villageId,
      isDeleted: false 
    });
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in your village' });
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

// Mark deceased - FILTER BY VILLAGE
const markDeceased = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    const member = await Member.findOne({ 
      _id: req.params.id, 
      villageId: villageId,
      isDeleted: false 
    });
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in your village' });
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

// Search members - FILTER BY VILLAGE
const searchMembers = async (req, res) => {
  try {
    const { q } = req.query;
    const villageId = req.user.villageId;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    
    const regex = { $regex: q, $options: 'i' };
    const members = await Member.find({
      isDeleted: false,
      villageId: villageId,
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

module.exports = {
  addMember,
  getFamilyMembers,
  getMember,
  updateMember,
  deleteMember,
  markDeceased,
  searchMembers
};