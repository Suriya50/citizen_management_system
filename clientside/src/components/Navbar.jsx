import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBell, FaBars, FaSearch } from 'react-icons/fa';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-20">
      <div className="px-3 py-2 flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
          <FaBars size={18} />
        </button>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name, Aadhar, Voter ID, or Family ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button className="relative text-gray-500">
            <FaBell size={14} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">3</span>
          </button>

          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-1">
              <FaUserCircle size={22} className="text-gray-500" />
              <span className="hidden sm:inline text-xs font-medium text-gray-700">{user?.name?.split(' ')[0] || 'Officer'}</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-30">
                <div className="p-2 border-b">
                  <p className="text-xs font-medium">{user?.name}</p>
                  <p className="text-[10px] text-gray-500">{user?.village || 'Village'}</p>
                </div>
                <button onClick={logout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 text-xs flex items-center gap-2">
                  <FaSignOutAlt size={10} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;