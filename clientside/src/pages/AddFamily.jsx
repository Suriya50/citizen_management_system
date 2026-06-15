import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddFamily = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [familyData, setFamilyData] = useState({
    headOfFamily: '',
    address: { street: '', area: '', pincode: '' },
    bplCardNumber: '',
    economicStatus: 'BPL'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted');
    console.log('Family Data:', familyData);
    
    // Validation
    if (!familyData.headOfFamily || !familyData.headOfFamily.trim()) {
      toast.error('Please enter head of family name');
      return;
    }
    if (!familyData.address.street || !familyData.address.street.trim()) {
      toast.error('Please enter street address');
      return;
    }

    setSubmitting(true);
    
    try {
      // Send data exactly as backend expects
      const dataToSend = {
        headOfFamily: familyData.headOfFamily.trim(),
        address: {
          street: familyData.address.street.trim(),
          area: familyData.address.area?.trim() || '',
          pincode: familyData.address.pincode?.trim() || ''
        },
        bplCardNumber: familyData.bplCardNumber?.trim() || '',
        economicStatus: familyData.economicStatus
      };
      
      console.log('Sending data:', dataToSend);
      
      const response = await api.post('/families', dataToSend);
      console.log('Response:', response.data);
      
      toast.success('Family created successfully!');
      navigate('/families');
    } catch (error) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || 'Failed to create family';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const menuItems = [
    { path: '/', name: 'Dashboard' },
    { path: '/families', name: 'Families' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-green-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">Village Citizen</h1>
              <p className="text-[9px] text-green-300">Management System</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white text-xl">&times;</button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="block w-full text-left px-4 py-3 mx-2 rounded-lg text-green-100 hover:bg-green-700 transition text-sm">
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-green-700 text-[9px] text-green-300 text-center">Govt of Tamil Nadu</div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <nav className="bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-10">
          <div className="px-3 py-2 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-800">Add New Family</h1>
          </div>
        </nav>

        <main className="p-4 mt-12 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/families')} className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Add New Family</h1>
              <p className="text-sm text-gray-500">Register a family in the village</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Head of Family <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={familyData.headOfFamily} 
                  onChange={(e) => setFamilyData({...familyData, headOfFamily: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter head of family name"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={familyData.address.street} 
                  onChange={(e) => setFamilyData({...familyData, address: {...familyData.address, street: e.target.value}})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  placeholder="Enter street name"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <input 
                    type="text" 
                    value={familyData.address.area} 
                    onChange={(e) => setFamilyData({...familyData, address: {...familyData.address, area: e.target.value}})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Area / Locality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    value={familyData.address.pincode} 
                    onChange={(e) => setFamilyData({...familyData, address: {...familyData.address, pincode: e.target.value}})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Pincode"
                    maxLength="6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ration Card Number</label>
                <input 
                  type="text" 
                  value={familyData.bplCardNumber} 
                  onChange={(e) => setFamilyData({...familyData, bplCardNumber: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter ration card number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Economic Status</label>
                <select 
                  value={familyData.economicStatus} 
                  onChange={(e) => setFamilyData({...familyData, economicStatus: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  <option value="BPL">BPL (Below Poverty Line)</option>
                  <option value="APL">APL (Above Poverty Line)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button 
                type="button" 
                onClick={() => navigate('/families')} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaSave size={14} /> {submitting ? 'Saving...' : 'Save Family'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddFamily;