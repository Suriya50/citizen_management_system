import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaPlusCircle, FaGift, FaFileAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ toggleSidebar, isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (location.pathname === '/login' || !user) return null;

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: FaHome },
    { path: '/families', name: 'Families', icon: FaUsers },
    { path: '/families/add', name: 'Add Family', icon: FaPlusCircle },
    { path: '/schemes', name: 'Schemes', icon: FaGift },
    { path: '/reports', name: 'Reports', icon: FaFileAlt },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-xl z-30 hidden lg:block">
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm">Village Citizen</h1>
              <p className="text-[9px] text-green-300">Management System</p>
            </div>
          </div>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition text-sm ${
                  isActive ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700'
                }`
              }
            >
              <item.icon size={14} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-3 border-t border-green-700 text-[9px] text-green-300 text-center">
          Govt of Tamil Nadu
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
          <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-xl z-50 lg:hidden">
            <div className="p-4 border-b border-green-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="font-bold text-sm">Village Citizen</h1>
                  <p className="text-[9px] text-green-300">Management System</p>
                </div>
              </div>
              <button onClick={toggleSidebar} className="text-white text-xl">&times;</button>
            </div>
            <nav className="mt-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition text-sm ${
                      isActive ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700'
                    }`
                  }
                >
                  <item.icon size={14} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 w-full p-3 border-t border-green-700 text-[9px] text-green-300 text-center">
              Govt of Tamil Nadu
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;