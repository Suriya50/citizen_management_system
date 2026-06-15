import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaDownload, FaFileExcel, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [stats, setStats] = useState({
    totalFamilies: 0, totalMembers: 0, bplFamilies: 0, aplFamilies: 0,
    maleCount: 0, femaleCount: 0, childrenCount: 0, seniorCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get('/reports/export/families', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `families_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      link.remove();
      toast.success('Report exported');
    } catch (error) {
      toast.error('Failed to export');
    }
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
          <div className="px-3 py-2 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-800">Reports</h1>
          </div>
        </nav>

        <main className="p-4 mt-12">
          <div className="mb-4"><h1 className="text-xl font-bold">Reports & Analytics</h1><p className="text-sm text-gray-500">Village statistics</p></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-500">Total Families</p><p className="text-2xl font-bold">{stats.totalFamilies}</p></div>
            <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-500">Total Citizens</p><p className="text-2xl font-bold">{stats.totalMembers}</p></div>
            <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-500">BPL Families</p><p className="text-2xl font-bold text-orange-600">{stats.bplFamilies}</p></div>
            <div className="bg-white rounded-lg shadow p-4"><p className="text-sm text-gray-500">APL Families</p><p className="text-2xl font-bold text-green-600">{stats.aplFamilies}</p></div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-md font-bold mb-3 flex items-center gap-2"><FaChartBar /> Export Report</h2>
            <button onClick={exportReport} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"><FaFileExcel /> Export to Excel</button>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow p-4 text-white">
            <div className="flex justify-between items-center mb-3"><h3 className="text-md font-bold">Demographics</h3><FaCalendarAlt /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-2xl font-bold">{stats.totalMembers ? ((stats.maleCount/stats.totalMembers)*100).toFixed(1) : 0}%</p><p className="text-xs">Male</p></div>
              <div><p className="text-2xl font-bold">{stats.totalMembers ? ((stats.femaleCount/stats.totalMembers)*100).toFixed(1) : 0}%</p><p className="text-xs">Female</p></div>
              <div><p className="text-2xl font-bold">{stats.totalMembers ? ((stats.childrenCount/stats.totalMembers)*100).toFixed(1) : 0}%</p><p className="text-xs">Children</p></div>
              <div><p className="text-2xl font-bold">{stats.totalMembers ? ((stats.seniorCount/stats.totalMembers)*100).toFixed(1) : 0}%</p><p className="text-xs">Senior</p></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;