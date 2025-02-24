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
    <div className="w-80 h-full bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex flex-col">
      {/* App Brand Section */}
      

      {/* User Profile Section */}
      {user && (
        <div className="p-6 border-b border-gray-800/30">
          <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-2xl p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm font-medium">Welcome back,</p>
                <p className="text-white font-bold text-lg truncate">
                  {user.name || user.email}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link
                to="/admin-center"
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors group"
              >
                <Settings className="w-4 h-4 mr-2 text-blue-400 group-hover:text-blue-300" />
                <span className="text-sm text-gray-300 group-hover:text-white">Admin</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-red-900/50 transition-colors group"
              >
                <LogOut className="w-4 h-4 mr-2 text-gray-400 group-hover:text-red-400" />
                <span className="text-sm text-gray-300 group-hover:text-red-300">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white shadow-lg border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className={`${isActive(item.path) ? 'text-blue-400' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Footer with KPMG Logo */}
      <div className="p-6 border-t border-gray-800/30">
        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-2xl p-4 text-center">
          <img 
            src={kpmgLogo} 
            alt="PK-Hub Opps" 
            className="h-16 w-auto mx-auto opacity-70 hover:opacity-100 transition-all duration-300 transform hover:scale-105" 
          />
          <p className="text-xs text-gray-500 mt-3 font-medium tracking-wider">
            PK-HUB OPPS APPLICATION
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
