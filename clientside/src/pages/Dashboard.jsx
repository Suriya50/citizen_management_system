import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaUsers, FaHome, FaMale, FaFemale, FaChild, FaUserGraduate, FaHandHoldingHeart, FaFileAlt, FaPlusCircle, FaListAlt } from 'react-icons/fa';
import { MdFamilyRestroom } from 'react-icons/md';
import api from '../services/api';

const Dashboard = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFamilies: 0, totalMembers: 0, bplFamilies: 0, aplFamilies: 0,
    maleCount: 0, femaleCount: 0, childrenCount: 0, seniorCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [villageName, setVillageName] = useState('');

  useEffect(() => {
    fetchDashboardData();
    // Get village name from localStorage
    const village = localStorage.getItem('village') || user?.village || '';
    setVillageName(village);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // API interceptor automatically sends villageId in headers
      const response = await api.get('/dashboard/stats');
      console.log('📊 Dashboard stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name?.split(' ')[0] || 'Officer'}!</h1>
            <p className="text-sm text-gray-500">
              Village Panchayat Dashboard 
              {villageName && <span className="text-green-600 font-medium"> - {villageName}</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {demographicCards.map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/families/add" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700">
              <FaPlusCircle className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">Add Family</p>
            </Link>
            <Link to="/families" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700">
              <FaListAlt className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">View All</p>
            </Link>
            <Link to="/schemes" className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700">
              <FaHandHoldingHeart className="mx-auto text-2xl mb-2" />
              <p className="text-sm font-medium">Schemes</p>
            </Link>
            <Link to="/reports" className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700">
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