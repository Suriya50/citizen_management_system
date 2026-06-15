const Member = require('../models/Member');

const generateCitizenId = async (familyId) => {
  const count = await Member.countDocuments({ familyId, isDeleted: false });
  const number = (count + 1).toString().padStart(3, '0');
  return `CIT-${number}`;
};

module.exports = generateCitizenId;