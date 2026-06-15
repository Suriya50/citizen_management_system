const Family = require('../models/Family');
const Member = require('../models/Member');

const getDashboardStats = async (req, res) => {
  try {
    const totalFamilies = await Family.countDocuments({ isDeleted: false });
    const totalMembers = await Member.countDocuments({ isDeleted: false });
    const bplFamilies = await Family.countDocuments({ isDeleted: false, economicStatus: 'BPL' });
    const aplFamilies = await Family.countDocuments({ isDeleted: false, economicStatus: 'APL' });
    const maleCount = await Member.countDocuments({ isDeleted: false, gender: 'Male', isAlive: true });
    const femaleCount = await Member.countDocuments({ isDeleted: false, gender: 'Female', isAlive: true });
    const childrenCount = await Member.countDocuments({ isDeleted: false, age: { $lt: 18 }, isAlive: true });
    const seniorCount = await Member.countDocuments({ isDeleted: false, age: { $gte: 60 }, isAlive: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAdded = await Family.countDocuments({ createdAt: { $gte: today } });
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthAdded = await Family.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    res.json({
      totalFamilies, totalMembers, bplFamilies, aplFamilies,
      maleCount, femaleCount, childrenCount, seniorCount,
      todayAdded, thisMonthAdded
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardStats };