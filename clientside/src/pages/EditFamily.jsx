import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditFamily = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [familyData, setFamilyData] = useState({
    headOfFamily: '',
    address: { street: '', area: '', pincode: '' },
    bplCardNumber: '',
    economicStatus: 'BPL'
  });

  useEffect(() => {
    fetchFamily();
  }, [id]);

  const fetchFamily = async () => {
    try {
      const response = await api.get(`/families/${id}`);
      const family = response.data.data;
      setFamilyData({
        headOfFamily: family.headOfFamily,
        address: family.address || { street: '', area: '', pincode: '' },
        bplCardNumber: family.bplCardNumber || '',
        economicStatus: family.economicStatus || 'BPL'
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load family');
      navigate('/families');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/families/${id}`, familyData);
      toast.success('Family updated successfully');
      navigate(`/families/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to update family');
    } finally {
      setSubmitting(false);
    }
  };

  const menuItems = [
    { path: '/', name: 'Dashboard' },
    { path: '/families', name: 'Families' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-green-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div><h1 className="font-bold text-sm text-white">Village Citizen</h1><p className="text-[9px] text-green-300">Management System</p></div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white text-xl">&times;</button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="block w-full text-left px-4 py-3 mx-2 rounded-lg text-green-100 hover:bg-green-700 text-sm">
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-green-700 text-[9px] text-green-300 text-center">Govt of Tamil Nadu</div>
      </div>

      <div className="lg:ml-64">
        <nav className="bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-10">
          <div className="px-3 py-2 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-800">Edit Family</h1>
          </div>
        </nav>

        <main className="p-4 mt-12 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(`/families/${id}`)} className="text-gray-600">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Edit Family</h1>
              <p className="text-sm text-gray-500">Update family information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head of Family *</label>
                <input 
                  type="text" 
                  value={familyData.headOfFamily} 
                  onChange={(e) => setFamilyData({...familyData, headOfFamily: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input 
                  type="text" 
                  value={familyData.address.street} 
                  onChange={(e) => setFamilyData({...familyData, address: {...familyData.address, street: e.target.value}})} 
                  className="w-full px-3 py-2 border rounded-md"
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
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    value={familyData.address.pincode} 
                    onChange={(e) => setFamilyData({...familyData, address: {...familyData.address, pincode: e.target.value}})} 
                    className="w-full px-3 py-2 border rounded-md"
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
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Economic Status</label>
                <select 
                  value={familyData.economicStatus} 
                  onChange={(e) => setFamilyData({...familyData, economicStatus: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="BPL">BPL (Below Poverty Line)</option>
                  <option value="APL">APL (Above Poverty Line)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button type="button" onClick={() => navigate(`/families/${id}`)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                <FaSave className="inline mr-2" size={14} /> {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default EditFamily;