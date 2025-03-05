import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, Settings, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import kpmgLogo from '../assets/kpmg.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Recruitment Management', icon: <Briefcase size={20} />, path: '/manage' },
    { name: 'Resource Management', icon: <Users size={20} />, path: '/employees' },
  ];

  return (
    <div className="w-52 lg:w-64 xl:w-80 2xl:w-96 h-full bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex flex-col">
      {/* User Profile Section */}
      {user && (
        <div className="p-2 lg:p-3 xl:p-4 2xl:p-6 border-b border-gray-800/30">
          <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-lg xl:rounded-xl 2xl:rounded-2xl p-2 lg:p-3 xl:p-4 2xl:p-5">
            <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4 2xl:space-x-5">
              <div className="w-8 h-8 lg:w-12 lg:h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 rounded-lg xl:rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
                <span className="font-bold text-base lg:text-lg xl:text-2xl 2xl:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] lg:text-xs xl:text-sm 2xl:text-base text-gray-400 font-medium">
                  Welcome back,
                </p>
                <p className="text-xs lg:text-sm xl:text-base 2xl:text-lg text-white font-bold truncate">
                  {user.name || user.email}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] lg:text-xs xl:text-sm 2xl:text-base font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5 lg:mt-1">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-1 lg:gap-1.5 xl:gap-2 mt-2 lg:mt-2.5 xl:mt-3 2xl:mt-4">
              {user?.role === 'admin' ? (
                <Link
                  to="/admin-center"
                  className="flex items-center justify-center px-1.5 py-1 rounded-md group text-[10px] lg:text-xs xl:text-sm 2xl:text-base bg-gray-700/50 hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1 lg:mr-1.5 xl:mr-2 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">Admin</span>
                </Link>
              ) : (
                <Link
                  to="/settings"
                  className="flex items-center justify-center px-1.5 py-1 rounded-md group text-[10px] lg:text-xs xl:text-sm 2xl:text-base bg-gray-700/50 hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1 lg:mr-1.5 xl:mr-2 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">Settings</span>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center px-1.5 py-1 rounded-md group text-[10px] lg:text-xs xl:text-sm 2xl:text-base bg-gray-700/50 hover:bg-red-900/50 transition-colors"
              >
                <LogOut className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1 lg:mr-1.5 xl:mr-2 text-gray-400 group-hover:text-red-400" />
                <span className="text-gray-300 group-hover:text-red-300">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 py-2 lg:py-3 xl:py-4 2xl:py-6 px-2 lg:px-3 xl:px-4 2xl:px-5">
        <div className="space-y-0.5 lg:space-y-1 xl:space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1.5 lg:space-x-3 xl:space-x-4 2xl:space-x-5 px-2 lg:px-3 xl:px-4 2xl:px-5 py-1 lg:py-2 xl:py-3 2xl:py-4 rounded-md xl:rounded-lg 2xl:rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white shadow-lg border border-blue-500/20'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span className={isActive(item.path) ? 'text-blue-400' : 'text-gray-400'}>
                {React.cloneElement(item.icon, { 
                  className: 'w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6'
                })}
              </span>
              <span className="font-medium text-[10px] lg:text-xs xl:text-base 2xl:text-lg truncate">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer with KPMG Logo */}
      <div className="p-2 lg:p-3 xl:p-4 2xl:p-6 border-t border-gray-800/30">
        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-lg xl:rounded-xl 2xl:rounded-2xl p-2 lg:p-3 xl:p-4 2xl:p-5 text-center">
          <img 
            src={kpmgLogo} 
            alt="PK-Hub Opps" 
            className="h-8 lg:h-10 xl:h-14 2xl:h-20 w-auto mx-auto opacity-70 hover:opacity-100 transition-all duration-300 transform hover:scale-105"
          />
          <p className="text-[9px] lg:text-xs xl:text-sm 2xl:text-base text-gray-500 mt-1 lg:mt-2 xl:mt-3 2xl:mt-4 font-medium tracking-wider">
            PK-HUB OPPS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
