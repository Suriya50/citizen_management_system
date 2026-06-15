const Family = require('../models/Family');
const Member = require('../models/Member');

// Generate unique family ID - WORKS WITH EXISTING DATA, NO CLEAR NEEDED
const generateFamilyId = async () => {
  try {
    // Get the family with the highest familyId number
    const allFamilies = await Family.find({ isDeleted: false }).select('familyId');
    
    console.log(`Found ${allFamilies.length} existing families`);
    
    if (allFamilies.length === 0) {
      return 'FAM-0001';
    }
    
    // Find the maximum number from existing family IDs
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
    
    console.log(`✅ Generated new Family ID: ${newFamilyId} (next after ${maxNumber})`);
    return newFamilyId;
  } catch (error) {
    console.error('Error generating family ID:', error);
    return `FAM-${Date.now()}`;
  }
};

// Create new family - WORKS WITHOUT CLEARING DATABASE
const createFamily = async (req, res) => {
  try {
    const { headOfFamily, address, bplCardNumber, economicStatus } = req.body;
    
    console.log('📝 Creating new family...');
    
    // Validation
    if (!headOfFamily || !headOfFamily.trim()) {
      return res.status(400).json({ success: false, message: 'Head of family is required' });
    }
    if (!address || !address.street || !address.street.trim()) {
      return res.status(400).json({ success: false, message: 'Street address is required' });
    }
    
    // Generate unique family ID based on EXISTING data
    const familyId = await generateFamilyId();
    console.log('📌 Generated Family ID:', familyId);
    
    // Create family
    const family = await Family.create({
      familyId,
      headOfFamily: headOfFamily.trim(),
      address: {
        street: address.street.trim(),
        area: address.area?.trim() || '',
        pincode: address.pincode?.trim() || ''
      },
      bplCardNumber: bplCardNumber?.trim() || '',
      economicStatus: economicStatus || 'BPL',
      createdBy: req.user.id
    });
    
    console.log('✅ Family created successfully:', family.familyId);
    
    res.status(201).json({ success: true, data: family });
  } catch (error) {
    console.error('❌ Error creating family:', error);
    
    if (error.code === 11000) {
      // If duplicate happens (extremely rare), try one more time
      try {
        const newId = `FAM-${Date.now()}`;
        const family = await Family.create({
          familyId: newId,
          headOfFamily: req.body.headOfFamily.trim(),
          address: {
            street: req.body.address.street.trim(),
            area: req.body.address.area?.trim() || '',
            pincode: req.body.address.pincode?.trim() || ''
          },
          bplCardNumber: req.body.bplCardNumber?.trim() || '',
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

// Get all families
const getFamilies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    
    let query = { isDeleted: false };
    
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single family
const getFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family || family.isDeleted) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    res.json({ success: true, data: family });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update family
const updateFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() }, 
      { new: true }
    );
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    res.json({ success: true, data: family });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete family
const deleteFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    await Member.updateMany({ familyId: req.params.id }, { isDeleted: true });
    res.json({ success: true, message: 'Family deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent families
const getRecentFamilies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const families = await Family.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(families);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFamily,
  getFamilies,
  getFamily,
  updateFamily,
  deleteFamily,
  getRecentFamilies
};