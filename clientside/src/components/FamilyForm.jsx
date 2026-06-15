import { FaHome, FaMapMarkerAlt, FaIdCard, FaRupeeSign } from 'react-icons/fa';

const FamilyForm = ({ familyData, setFamilyData, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFamilyData({ ...familyData, [name]: value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFamilyData({
      ...familyData,
      address: { ...familyData.address, [name]: value }
    });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-bold text-gray-800 mb-4">Family Information</h2>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Head of Family Name *</label>
          <div className="relative">
            <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" name="headOfFamily" value={familyData.headOfFamily} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="Enter name" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Street Name *</label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" name="street" value={familyData.address.street} onChange={handleAddressChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="Enter street" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Area</label><input type="text" name="area" value={familyData.address.area} onChange={handleAddressChange} className="w-full px-3 py-1.5 text-sm border rounded-md" placeholder="Area" /></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label><input type="text" name="pincode" value={familyData.address.pincode} onChange={handleAddressChange} className="w-full px-3 py-1.5 text-sm border rounded-md" placeholder="Pincode" maxLength="6" /></div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ration Card Number</label>
          <div className="relative"><FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><input type="text" name="bplCardNumber" value={familyData.bplCardNumber} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md" placeholder="Enter number" /></div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Economic Status</label>
          <div className="relative"><FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /><select name="economicStatus" value={familyData.economicStatus} onChange={handleChange} className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md"><option value="BPL">BPL (Below Poverty Line)</option><option value="APL">APL (Above Poverty Line)</option></select></div>
        </div>
      </div>

      <div className="mt-4 flex justify-end"><button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm">Continue →</button></div>
    </form>
  );
};

export default FamilyForm;