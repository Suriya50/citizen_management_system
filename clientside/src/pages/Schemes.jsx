import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaPlus, FaGift, FaCalendarAlt, FaUsers, FaCheckCircle, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({ name: '', description: '', eligibility: 'BPL', deadline: '', benefits: '' });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await api.get('/schemes');
      setSchemes(response.data);
    } catch (error) {
      toast.error('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  const addScheme = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schemes', newScheme);
      toast.success('Scheme added');
      setShowModal(false);
      setNewScheme({ name: '', description: '', eligibility: 'BPL', deadline: '', benefits: '' });
      fetchSchemes();
    } catch (error) {
      toast.error('Failed to add scheme');
    }
  };

  const deleteScheme = async (id) => {
    if (window.confirm('Delete this scheme?')) {
      try {
        await api.delete(`/schemes/${id}`);
        toast.success('Scheme deleted');
        fetchSchemes();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const distributeScheme = async (id) => {
    try {
      const response = await api.post(`/schemes/${id}/distribute`);
      toast.success(response.data.message);
      fetchSchemes();
    } catch (error) {
      toast.error('Failed to distribute');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'expired') return 'bg-gray-100 text-gray-500';
    return 'bg-yellow-100 text-yellow-700';
  };

  const menuItems = [
    { path: '/', name: 'Dashboard' },
    { path: '/families', name: 'Families' },
    { path: '/families/add', name: 'Add Family' },
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
            <button key={item.path} onClick={() => { window.location.href = item.path; setSidebarOpen(false); }} className="block w-full text-left px-4 py-3 mx-2 rounded-lg text-green-100 hover:bg-green-700 text-sm">
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-green-700 text-[9px] text-green-300 text-center">Govt of Tamil Nadu</div>
      </div>

      <div className="lg:ml-64">
        <nav className="bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-10">
          <div className="px-3 py-2 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-800">Schemes</h1>
            <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"><FaPlus size={10} /> Add</button>
          </div>
        </nav>

        <main className="p-4 mt-12">
          <div className="mb-4"><h1 className="text-xl font-bold">Government Schemes</h1><p className="text-sm text-gray-500">Manage welfare distributions</p></div>

          {schemes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center"><FaGift className="text-5xl text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No schemes added</p><button onClick={() => setShowModal(true)} className="mt-3 bg-green-600 text-white px-3 py-1 rounded-md text-sm">Add First Scheme</button></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemes.map((scheme) => (
                <div key={scheme._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div><h3 className="text-lg font-bold">{scheme.name}</h3><p className="text-sm text-gray-500 mt-1">{scheme.description}</p></div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(scheme.status)}`}>{scheme.status}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><FaUsers /> Eligibility: {scheme.eligibility}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500"><FaCalendarAlt /> Deadline: {new Date(scheme.deadline).toLocaleDateString()}</div>
                    {scheme.benefits && <div className="text-sm text-gray-500"><strong>Benefits:</strong> {scheme.benefits}</div>}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm">{scheme.beneficiaries?.length || 0} families benefited</span>
                    <div className="flex gap-2">
                      {scheme.status === 'active' && <button onClick={() => distributeScheme(scheme._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><FaCheckCircle size={12} /> Distribute</button>}
                      <button onClick={() => deleteScheme(scheme._id)} className="text-red-600"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
              <div className="bg-white rounded-lg p-5 max-w-md w-full">
                <h3 className="text-lg font-bold mb-3">Add New Scheme</h3>
                <form onSubmit={addScheme} className="space-y-3">
                  <input type="text" placeholder="Scheme Name" value={newScheme.name} onChange={(e) => setNewScheme({...newScheme, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
                  <textarea placeholder="Description" rows="2" value={newScheme.description} onChange={(e) => setNewScheme({...newScheme, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
                  <select value={newScheme.eligibility} onChange={(e) => setNewScheme({...newScheme, eligibility: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="BPL">BPL Only</option><option value="APL">APL Only</option><option value="ALL">All Families</option>
                  </select>
                  <input type="date" value={newScheme.deadline} onChange={(e) => setNewScheme({...newScheme, deadline: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
                  <input type="text" placeholder="Benefits" value={newScheme.benefits} onChange={(e) => setNewScheme({...newScheme, benefits: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded-md">Cancel</button>
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded-md">Add</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Schemes;