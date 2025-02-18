import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'Recruitment Management', icon: <Briefcase size={20} />, path: '/manage' },
    { name: 'Resource Management', icon: <Users size={20} />, path: '/employees' },
  ];

  return (
    <div className="w-80 h-full bg-black border-r border-gray-800 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.04, 0.07, 0.04],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-800/50">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-2xl">P</span>
            </motion.div>
            <span className="text-2xl font-bold text-white tracking-wide">PK Hub</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 pt-8 px-6 space-y-2">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
                }`}
              >
                <span className={isActive(item.path) ? 'text-white' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800/50 p-6 backdrop-blur-sm bg-black/10">
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex items-center space-x-4"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg ring-1 ring-gray-700/50">
              <span className="text-gray-300 font-semibold text-lg">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-300">Admin User</p>
              <p className="text-xs text-gray-500">admin@pkhub.com</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <LogOut size={22} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
