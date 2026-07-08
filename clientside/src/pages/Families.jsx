import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaDownload, FaHome, FaUser } from 'react-icons/fa';
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
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsData, setSearchResultsData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const village = localStorage.getItem('village') || '';
    setVillageName(village);
    
    if (searchTerm && searchTerm.length >= 2) {
      fetchSearchResults();
    } else {
      fetchFamilies();
    }
  }, [currentPage, filterStatus, searchTerm]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      setIsSearching(false);
      const response = await api.get('/families', {
        params: { page: currentPage, limit: 10, search: '', status: filterStatus }
      });
      setFamilies(response.data.families || []);
      setSearchResults([]);
      setTotalFamilies(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setIsSearching(true);
      
      // Search families
      const familyResponse = await api.get('/families', {
        params: { page: 1, limit: 50, search: searchTerm, status: filterStatus }
      });
      
      // Search members
      const memberResponse = await api.get('/members/search', {
        params: { q: searchTerm }
      }).catch(() => ({ data: [] }));
      
      setSearchResultsData(memberResponse.data || []);
      
      const memberFamilyIds = (memberResponse.data || []).map(m => m.familyId?._id || m.familyId).filter(Boolean);
      
      let memberFamilies = [];
      if (memberFamilyIds.length > 0) {
        const uniqueFamilyIds = [...new Set(memberFamilyIds.map(id => id.toString()))];
        const familyPromises = uniqueFamilyIds.map(id => 
          api.get(`/families/${id}`).catch(() => null)
        );
        const familyResponses = await Promise.all(familyPromises);
        memberFamilies = familyResponses
          .filter(res => res && res.data && res.data.success)
          .map(res => res.data.data);
      }
      
      const familyResults = familyResponse.data.families || [];
      const allResults = [...familyResults, ...memberFamilies];
      
      const uniqueResults = [];
      const seenIds = new Set();
      for (const family of allResults) {
        if (family && family._id && !seenIds.has(family._id.toString())) {
          seenIds.add(family._id.toString());
          uniqueResults.push(family);
        }
      }
      
      setSearchResults(uniqueResults);
      setFamilies([]);
      setTotalFamilies(uniqueResults.length);
      setTotalPages(1);
      
      console.log(`✅ Found ${uniqueResults.length} families matching "${searchTerm}"`);
      
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const highlightMatch = (text) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-200 font-bold px-0.5">{part}</span> : part
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm });
    setCurrentPage(1);
    if (searchTerm && searchTerm.length >= 2) {
      fetchSearchResults();
    } else {
      fetchFamilies();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
    setCurrentPage(1);
    setIsSearching(false);
    fetchFamilies();
  };

  const handleDelete = async (id, familyId) => {
    if (window.confirm(`Delete family ${familyId}? This will delete all members too.`)) {
      try {
        await api.delete(`/families/${id}`);
        toast.success('Family deleted');
        if (isSearching) {
          fetchSearchResults();
        } else {
          fetchFamilies();
        }
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
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

  const displayFamilies = isSearching ? searchResults : families;

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
            <div>
              <h1 className="text-xl font-bold">Family Management</h1>
              <p className="text-sm text-gray-500">
                {isSearching && searchTerm 
                  ? `Search results for "${searchTerm}": ${totalFamilies} families found` 
                  : `Total: ${totalFamilies} families`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm">Export</button>
              <Link to="/families/add" className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm">Add Family</Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Name, Mobile, Aadhar, Voter ID, or Family ID..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-md w-full sm:w-32">
                <option value="all">All</option><option value="BPL">BPL</option><option value="APL">APL</option>
              </select>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">Search</button>
              {searchTerm && <button type="button" onClick={clearSearch} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">Clear</button>}
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div></div>
          ) : displayFamilies.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">
                {isSearching ? `No families found matching "${searchTerm}"` : 'No families found in your village'}
              </p>
              <Link to="/families/add" className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm">Add First Family</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayFamilies.map((family) => {
                const matchedMembers = searchResultsData.filter(m => 
                  m.familyId?._id === family._id || m.familyId === family._id
                );
                
                return (
                  <div 
                    key={family._id} 
                    onClick={() => navigate(`/families/${family._id}`)} 
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {isSearching && searchTerm ? highlightMatch(family.headOfFamily) : family.headOfFamily}
                        </p>
                        <p className="text-sm text-gray-500">ID: {family.familyId}</p>
                        <p className="text-sm text-gray-600 mt-1">📍 {family.address?.street || 'N/A'}</p>
                        
                        {matchedMembers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {matchedMembers.slice(0, 3).map((member, idx) => (
                              <span key={idx} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                <FaUser className="mr-1" size={10} />
                                {isSearching && searchTerm ? highlightMatch(member.name) : member.name}
                              </span>
                            ))}
                            {matchedMembers.length > 3 && (
                              <span className="text-xs text-gray-500">+{matchedMembers.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${family.economicStatus === 'BPL' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {family.economicStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-gray-500">👥 {family.totalMembers || 0} members</p>
                      <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/families/${family._id}`} className="text-blue-600 hover:text-blue-800"><FaEye size={16} /></Link>
                        <Link to={`/families/edit/${family._id}`} className="text-green-600 hover:text-green-800"><FaEdit size={16} /></Link>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(family._id, family.familyId); }} className="text-red-600 hover:text-red-800"><FaTrash size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && !isSearching && (
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