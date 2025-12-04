import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/employee-dashboard',
      icon: '',
      description: 'Employee Details & Overview'
    },
    {
      name: 'Resource Tracker',
      path: 'resource-tracker', // Special case - will be handled in onClick
      icon: '',
      description: 'Individual Resource Tracking'
    },
    {
      name: 'Consolidated View',
      path: '/consolidated',
      icon: '',
      description: 'Team Utilization Overview'
    },
    {
      name: 'Utilization Report',
      path: '/report',
      icon: '',
      description: 'Analytics & Reports'
    },
    {
      name: 'Available Team',
      path: '/available',
      icon: '',
      description: 'Available Resources'
    },
    {
      name: 'Team Utilizations',
      path: '/Team',
      icon: '',
      description: 'View All Employees'
    }
  ];

  const isCurrentPath = (path) => {
    if (path === 'resource-tracker') {
      return location.pathname.startsWith('/tracker/');
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleNavigation = async (item) => {
    if (item.path === 'resource-tracker') {
      // For Resource Tracker, we need to find the employee record by email
      if (user?.email) {
        try {
          const response = await axios.post(
            '/rt/employees/find-by-email',
            { email: user.email }
          );

          if (response.data?.id) {
            navigate(`/tracker/${response.data.id}`);
          } else {
            // If no employee found, navigate to employee dashboard
            navigate('/employee-dashboard');
          }
        } catch (error) {
          console.error('Error finding employee:', error);
          // If error occurs, navigate to employee dashboard
          navigate('/employee-dashboard');
        }
      } else {
        // If no user email available, navigate to employee dashboard
        navigate('/employee-dashboard');
      }
    } else {
      navigate(item.path);
    }
    onToggle(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">RT</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Resource Tracker</h2>
                <p className="text-xs text-gray-500">Navigation Menu</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                ${isCurrentPath(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{item.name}</div>
                <div className={`text-xs ${isCurrentPath(item.path) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200"
          >
            <span className="text-2xl">🚪</span>
            <div className="text-left">
              <div className="font-semibold">Logout</div>
              <div className="text-xs text-red-400">Sign out of your account</div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 