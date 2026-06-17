const Member = require('../models/Member');
const Family = require('../models/Family');

// Generate unique citizen ID per family
const generateCitizenId = async (familyId) => {
  try {
    console.log(`🔍 Generating citizenId for family: ${familyId}`);
    
    const lastMember = await Member.findOne({ 
      familyId: familyId, 
      isDeleted: false 
    }).sort({ citizenId: -1 });
    
    console.log('📊 Last member found:', lastMember);
    
    if (!lastMember || !lastMember.citizenId) {
      console.log('📌 No existing members, returning CIT-001');
      return 'CIT-001';
    }
    
    console.log(`📌 Last member citizenId: ${lastMember.citizenId}`);
    
    const match = lastMember.citizenId.match(/CIT-(\d+)/);
    if (!match) {
      console.log('⚠️ No match found, returning CIT-001');
      return 'CIT-001';
    }
    
    const lastNumber = parseInt(match[1], 10);
    const newNumber = lastNumber + 1;
    const newCitizenId = `CIT-${newNumber.toString().padStart(3, '0')}`;
    console.log(`✅ Generated citizenId: ${newCitizenId} (from ${lastMember.citizenId})`);
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
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from token:', req.user ? JSON.stringify(req.user) : 'NO USER FOUND');
    
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
    
    // ✅ Check if user exists
    if (!req.user) {
      console.error('❌ No user found in request!');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login again.' 
      });
    }
    
    // Validation
    if (!familyId || !name || !age || !relationToHead) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing: familyId, name, age, relationToHead' 
      });
    }
    
    // ✅ Check family exists
    console.log(`🔍 Looking for family: ${familyId}`);
    const family = await Family.findOne({ 
      _id: familyId, 
      isDeleted: false 
    });
    
    if (!family) {
      console.error(`❌ Family not found: ${familyId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Family not found' 
      });
    }
    
    console.log(`✅ Family found: ${family.familyId}`);
    console.log(`✅ Family totalMembers before: ${family.totalMembers}`);
    
    // ✅ Check existing members
    const existingMembers = await Member.find({ 
      familyId: familyId,
      isDeleted: false 
    });
    console.log(`📊 Existing members in family: ${existingMembers.length}`);
    existingMembers.forEach(m => {
      console.log(`   - ${m.citizenId}: ${m.name}`);
    });
    
    // ✅ Generate citizenId
    const citizenId = await generateCitizenId(familyId);
    console.log(`✅ Generated citizenId: ${citizenId}`);
    
    // ✅ Create member
    const memberData = {
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
      disabilities: disabilities || 'None',
      createdBy: req.user.id
    };
    
    console.log('📝 Creating member with data:', memberData);
    
    const member = await Member.create(memberData);
    
    // Update family member count
    family.totalMembers = (family.totalMembers || 0) + 1;
    await family.save();
    
    console.log(`✅ Member added successfully: ${citizenId}`);
    console.log(`✅ Family totalMembers after: ${family.totalMembers}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Member added successfully', 
      data: member 
    });
    
  } catch (error) {
    console.error('❌ Error in addMember:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error keyPattern:', error.keyPattern);
    console.error('Error keyValue:', error.keyValue);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.aadharNumber) {
        return res.status(400).json({ 
          success: false, 
          message: 'Aadhar number already exists in the system' 
        });
      }
      if (error.keyPattern?.voterId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Voter ID already exists in the system' 
        });
      }
      if (error.keyPattern?.citizenId) {
        console.error('❌ Citizen ID conflict!');
        return res.status(400).json({ 
          success: false, 
          message: 'Citizen ID conflict. Please try again.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate entry. Please check your details.' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
};

// ✅ FIXED: Get family members - NO villageId filter
const getFamilyMembers = async (req, res) => {
  try {
    const members = await Member.find({ 
      familyId: req.params.familyId, 
      isDeleted: false 
    });
    console.log(`📊 Found ${members.length} members for family ${req.params.familyId}`);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ FIXED: Get single member - NO villageId filter
const getMember = async (req, res) => {
  try {
    const member = await Member.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    }).populate('familyId', 'familyId headOfFamily');
    
    if (!member) {
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
    const member = await Member.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
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

// Delete member
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
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
    const member = await Member.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
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

// ✅ FIXED: Search members - NO villageId filter
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

module.exports = {
  addMember,
  getFamilyMembers,
  getMember,
  updateMember,
  deleteMember,
  markDeceased,
  searchMembers
};