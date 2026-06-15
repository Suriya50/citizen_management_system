const Family = require('../models/Family');
const Member = require('../models/Member');
const ExcelJS = require('exceljs');

const getReportStats = async (req, res) => {
  try {
    const totalFamilies = await Family.countDocuments({ isDeleted: false });
    const totalMembers = await Member.countDocuments({ isDeleted: false });
    const bplFamilies = await Family.countDocuments({ isDeleted: false, economicStatus: 'BPL' });
    const aplFamilies = await Family.countDocuments({ isDeleted: false, economicStatus: 'APL' });
    const maleCount = await Member.countDocuments({ isDeleted: false, gender: 'Male', isAlive: true });
    const femaleCount = await Member.countDocuments({ isDeleted: false, gender: 'Female', isAlive: true });
    const childrenCount = await Member.countDocuments({ isDeleted: false, age: { $lt: 18 }, isAlive: true });
    const adultCount = await Member.countDocuments({ isDeleted: false, age: { $gte: 18, $lt: 60 }, isAlive: true });
    const seniorCount = await Member.countDocuments({ isDeleted: false, age: { $gte: 60 }, isAlive: true });
    
    res.json({ totalFamilies, totalMembers, bplFamilies, aplFamilies, maleCount, femaleCount, childrenCount, adultCount, seniorCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    const data = await Family.find({ isDeleted: false }).lean();
    
    worksheet.columns = [
      { header: 'Family ID', key: 'familyId', width: 15 },
      { header: 'Head of Family', key: 'headOfFamily', width: 25 },
      { header: 'Street', key: 'address.street', width: 20 },
      { header: 'Members', key: 'totalMembers', width: 15 },
      { header: 'Status', key: 'economicStatus', width: 10 },
      { header: 'Registered Date', key: 'createdAt', width: 15 }
    ];
    worksheet.addRows(data);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=families_report.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getReportStats, exportReport };