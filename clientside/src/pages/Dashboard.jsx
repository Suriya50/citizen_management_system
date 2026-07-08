import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaUsers, FaHome, FaMale, FaFemale, FaChild, FaUserGraduate, FaHandHoldingHeart, FaFileAlt, FaPlusCircle, FaListAlt, FaSearch } from 'react-icons/fa';
import { MdFamilyRestroom } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFamilies: 0, totalMembers: 0, bplFamilies: 0, aplFamilies: 0,
    maleCount: 0, femaleCount: 0, childrenCount: 0, seniorCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [villageName, setVillageName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentFamilies, setRecentFamilies] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentFamilies();
    // Get village name from localStorage
    const village = localStorage.getItem('village') || user?.village || '';
    setVillageName(village);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      console.log('📊 Dashboard stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFamilies = async () => {
    try {
      const response = await api.get('/families/recent', { params: { limit: 5 } });
      setRecentFamilies(response.data || []);
    } catch (error) {
      console.error('Error fetching recent families:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const statCards = [
    { title: 'Total Families', value: stats.totalFamilies, icon: FaHome, color: 'bg-blue-500' },
    { title: 'Total Citizens', value: stats.totalMembers, icon: FaUsers, color: 'bg-green-500' },
    { title: 'BPL Families', value: stats.bplFamilies, icon: MdFamilyRestroom, color: 'bg-orange-500' },
    { title: 'APL Families', value: stats.aplFamilies, icon: FaUserGraduate, color: 'bg-purple-500' },
  ];

  const demographicCards = [
    { title: 'Male', value: stats.maleCount, icon: FaMale, color: 'bg-cyan-500' },
    { title: 'Female', value: stats.femaleCount, icon: FaFemale, color: 'bg-pink-500' },
    { title: 'Children', value: stats.childrenCount, icon: FaChild, color: 'bg-yellow-500' },
    { title: 'Senior', value: stats.seniorCount, icon: FaUserGraduate, color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="ml-2 text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="lg:ml-64 pt-14">
        <main className="p-4">
          {/* Welcome Header */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name?.split(' ')[0] || 'Officer'}!</h1>
            <p className="text-sm text-gray-500">
              Village Panchayat Dashboard 
              {villageName && <span className="text-green-600 font-medium"> - {villageName}</span>}
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-5">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, Aadhar, Voter ID, or Family ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="text-white text-lg" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{card.value}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Demographic Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {demographicCards.map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.title}</p>
                </div>
                <div className={`${card.color} p-2 rounded-full`}>
                  <card.icon className="text-white text-sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Families */}
          {recentFamilies.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 mb-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800">📋 Recent Families</h2>
                <Link to="/families" className="text-sm text-green-600 hover:underline">View All →</Link>
              </div>
              <div className="space-y-2">
                {recentFamilies.map((family) => (
                  <Link
                    key={family._id}
                    to={`/families/${family._id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{family.headOfFamily}</p>
                        <p className="text-xs text-gray-500">ID: {family.familyId} • {family.totalMembers || 0} members</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        family.economicStatus === 'BPL' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {family.economicStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/families/add" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition">
              <FaPlusCircle className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">Add Family</p>
            </Link>
            <Link to="/families" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition">
              <FaListAlt className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">View All</p>
            </Link>
            <Link to="/schemes" className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition">
              <FaHandHoldingHeart className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">Schemes</p>
            </Link>
            <Link to="/reports" className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition">
              <FaFileAlt className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">Reports</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;