import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaDownload, FaHome } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Families = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [villageName, setVillageName] = useState('');

  useEffect(() => {
    // Get village name from localStorage
    const village = localStorage.getItem('village') || '';
    setVillageName(village);
    fetchFamilies();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      // API interceptor automatically sends villageId in headers
      const response = await api.get('/families', {
        params: { page: currentPage, limit: 10, search: searchTerm, status: filterStatus }
      });
      console.log('📋 Families fetched:', response.data.families?.length || 0);
      setFamilies(response.data.families || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalFamilies(response.data.total || 0);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, familyId) => {
    if (window.confirm(`Delete family ${familyId}? This will delete all members too.`)) {
      try {
        await api.delete(`/families/${id}`);
        toast.success('Family deleted');
        fetchFamilies();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm });
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
    setCurrentPage(1);
  };

  const exportToExcel = async () => {
    try {
      const response = await api.get('/reports/export/families', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `families_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      link.remove();
      toast.success('Export completed');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: FaHome },
    { path: '/families', name: 'Families', icon: FaEye },
    { path: '/families/add', name: 'Add Family', icon: FaPlus },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
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
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-green-100 hover:bg-green-700 transition text-sm">
              <item.icon size={16} /><span>{item.name}</span>
            </Link>
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
            <h1 className="text-sm font-semibold text-gray-800">Families</h1>
            {villageName && <span className="text-xs text-green-600 ml-2">🏠 {villageName}</span>}
          </div>
        </nav>

        <main className="p-4 mt-12">
          <div className="flex justify-between items-center mb-4">
            <div><h1 className="text-xl font-bold">Family Management</h1><p className="text-sm text-gray-500">Total: {totalFamilies} families</p></div>
            <div className="flex gap-2">
              <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm">Export</button>
              <Link to="/families/add" className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm">Add Family</Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by Family ID, Name, or Address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-md w-full sm:w-32">
                <option value="all">All</option><option value="BPL">BPL</option><option value="APL">APL</option>
              </select>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md">Search</button>
              {searchTerm && <button type="button" onClick={clearSearch} className="bg-gray-500 text-white px-4 py-2 rounded-md">Clear</button>}
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div></div>
          ) : families.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No families found in your village</p>
              <Link to="/families/add" className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm">Add First Family</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {families.map((family) => (
                <div key={family._id} onClick={() => navigate(`/families/${family._id}`)} className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <div><p className="text-lg font-bold text-gray-800">{family.headOfFamily}</p><p className="text-sm text-gray-500">ID: {family.familyId}</p><p className="text-sm text-gray-600 mt-1">📍 {family.address?.street || 'N/A'}</p></div>
                    <span className={`text-xs px-2 py-1 rounded-full ${family.economicStatus === 'BPL' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{family.economicStatus}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">👥 {family.totalMembers || 0} members</p>
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/families/${family._id}`} className="text-blue-600"><FaEye size={16} /></Link>
                      <Link to={`/families/edit/${family._id}`} className="text-green-600"><FaEdit size={16} /></Link>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(family._id, family.familyId); }} className="text-red-600"><FaTrash size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-md disabled:opacity-50">Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Families;