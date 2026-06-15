const Family = require('../models/Family');

const generateFamilyId = async () => {
  const count = await Family.countDocuments({ isDeleted: false });
  const number = (count + 1).toString().padStart(4, '0');
  return `FAM-${number}`;
};

module.exports = generateFamilyId;