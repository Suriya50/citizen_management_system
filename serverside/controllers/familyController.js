const Family = require('../models/Family');
const Member = require('../models/Member');

// Generate unique family ID PER VILLAGE
const generateFamilyId = async (villageId) => {
  try {
    // Get families ONLY in this village
    const allFamilies = await Family.find({ 
      villageId: villageId,
      isDeleted: false 
    }).select('familyId');
    
    console.log(`Found ${allFamilies.length} existing families in village: ${villageId}`);
    
    if (allFamilies.length === 0) {
      return 'FAM-0001';
    }
    
    // Find the maximum number from existing family IDs in THIS village
    let maxNumber = 0;
    for (const family of allFamilies) {
      if (family.familyId) {
        const match = family.familyId.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    
    const newNumber = maxNumber + 1;
    const newFamilyId = `FAM-${newNumber.toString().padStart(4, '0')}`;
    
    console.log(`✅ Generated new Family ID: ${newFamilyId} for village ${villageId}`);
    return newFamilyId;
  } catch (error) {
    console.error('Error generating family ID:', error);
    return `FAM-${Date.now()}`;
  }
};

// Create new family - WITH VILLAGE ISOLATION
const createFamily = async (req, res) => {
  try {
    const { headOfFamily, address, bplCardNumber, economicStatus } = req.body;
    
    // ✅ Get villageId from authenticated user
    const villageId = req.user.villageId;
    const createdBy = req.user.id;
    
    console.log('📝 Creating new family for village:', villageId);
    
    // Validation
    if (!headOfFamily || !headOfFamily.trim()) {
      return res.status(400).json({ success: false, message: 'Head of family is required' });
    }
    if (!address || !address.street || !address.street.trim()) {
      return res.status(400).json({ success: false, message: 'Street address is required' });
    }
    
    // Generate unique family ID based on THIS VILLAGE's existing data
    const familyId = await generateFamilyId(villageId);
    console.log('📌 Generated Family ID:', familyId);
    
    // Create family with villageId
    const family = await Family.create({
      familyId,
      villageId,  // ✅ CRITICAL: Save villageId
      headOfFamily: headOfFamily.trim(),
      address: {
        street: address.street.trim(),
        area: address.area?.trim() || '',
        pincode: address.pincode?.trim() || ''
      },
      bplCardNumber: bplCardNumber?.trim() || null,
      economicStatus: economicStatus || 'BPL',
      createdBy: createdBy
    });
    
    console.log('✅ Family created successfully:', family.familyId, 'for village:', villageId);
    
    res.status(201).json({ success: true, data: family });
  } catch (error) {
    console.error('❌ Error creating family:', error);
    
    if (error.code === 11000) {
      // Check if it's duplicate bplCardNumber
      if (error.keyPattern?.bplCardNumber) {
        return res.status(400).json({ 
          success: false, 
          message: 'BPL Card number already exists in your village' 
        });
      }
      
      // If duplicate familyId (rare), retry once
      try {
        const villageId = req.user.villageId;
        const newId = `FAM-${Date.now()}`;
        const family = await Family.create({
          familyId: newId,
          villageId: villageId,
          headOfFamily: req.body.headOfFamily.trim(),
          address: {
            street: req.body.address.street.trim(),
            area: req.body.address.area?.trim() || '',
            pincode: req.body.address.pincode?.trim() || ''
          },
          bplCardNumber: req.body.bplCardNumber?.trim() || null,
          economicStatus: req.body.economicStatus || 'BPL',
          createdBy: req.user.id
        });
        return res.status(201).json({ success: true, data: family });
      } catch (retryError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Unable to create family. Please try again.' 
        });
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all families - FILTER BY VILLAGE
const getFamilies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    
    // ✅ Filter by villageId from logged-in user
    const villageId = req.user.villageId;
    
    let query = { 
      villageId: villageId,  // ✅ CRITICAL: Only show families from this village
      isDeleted: false 
    };
    
    if (search) {
      query.$or = [
        { headOfFamily: { $regex: search, $options: 'i' } },
        { familyId: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.economicStatus = status;
    }
    
    const families = await Family.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Family.countDocuments(query);
    
    res.json({ 
      success: true, 
      families, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error('Error getting families:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single family - WITH VILLAGE CHECK
const getFamily = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    
    const family = await Family.findOne({ 
      _id: req.params.id, 
      villageId: villageId,  // ✅ Ensure family belongs to this village
      isDeleted: false 
    });
    
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found in your village' });
    }
    
    res.json({ success: true, data: family });
  } catch (error) {
    console.error('Error getting family:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update family - WITH VILLAGE CHECK
const updateFamily = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    
    // First check if family exists and belongs to this village
    const existingFamily = await Family.findOne({ 
      _id: req.params.id, 
      villageId: villageId,
      isDeleted: false 
    });
    
    if (!existingFamily) {
      return res.status(404).json({ success: false, message: 'Family not found in your village' });
    }
    
    const family = await Family.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: family });
  } catch (error) {
    console.error('Error updating family:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'BPL Card number already exists in your village' 
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete family - WITH VILLAGE CHECK
const deleteFamily = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    
    // First check if family exists and belongs to this village
    const family = await Family.findOne({ 
      _id: req.params.id, 
      villageId: villageId,
      isDeleted: false 
    });
    
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found in your village' });
    }
    
    // Soft delete family
    family.isDeleted = true;
    await family.save();
    
    // Soft delete all members of this family in this village
    await Member.updateMany(
      { familyId: req.params.id, villageId: villageId }, 
      { isDeleted: true }
    );
    
    res.json({ success: true, message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Error deleting family:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent families - FILTER BY VILLAGE
const getRecentFamilies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const villageId = req.user.villageId;
    
    const families = await Family.find({ 
      villageId: villageId,  // ✅ Only this village
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(families);
  } catch (error) {
    console.error('Error getting recent families:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats - FILTER BY VILLAGE
const getDashboardStats = async (req, res) => {
  try {
    const villageId = req.user.villageId;
    
    const totalFamilies = await Family.countDocuments({ 
      villageId: villageId, 
      isDeleted: false 
    });
    
    const totalMembers = await Member.countDocuments({ 
      villageId: villageId, 
      isDeleted: false 
    });
    
    const bplFamilies = await Family.countDocuments({ 
      villageId: villageId, 
      economicStatus: 'BPL', 
      isDeleted: false 
    });
    
    const aplFamilies = await Family.countDocuments({ 
      villageId: villageId, 
      economicStatus: 'APL', 
      isDeleted: false 
    });
    
    const maleCount = await Member.countDocuments({ 
      villageId: villageId, 
      gender: 'Male', 
      isDeleted: false 
    });
    
    const femaleCount = await Member.countDocuments({ 
      villageId: villageId, 
      gender: 'Female', 
      isDeleted: false 
    });
    
    const childrenCount = await Member.countDocuments({ 
      villageId: villageId, 
      age: { $lt: 18 }, 
      isDeleted: false 
    });
    
    const seniorCount = await Member.countDocuments({ 
      villageId: villageId, 
      age: { $gte: 60 }, 
      isDeleted: false 
    });
    
    res.json({
      success: true,
      totalFamilies,
      totalMembers,
      bplFamilies,
      aplFamilies,
      maleCount,
      femaleCount,
      childrenCount,
      seniorCount
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFamily,
  getFamilies,
  getFamily,
  updateFamily,
  deleteFamily,
  getRecentFamilies,
  getDashboardStats
};