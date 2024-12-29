import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  return (
    <div className="w-[20%] min-w-[200px] bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col h-screen border-r border-gray-800/50 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-black to-gray-900">
        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">PK-HUB OPPS</h1>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-black to-gray-900">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 ring-2 ring-gray-700 shadow-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="font-medium text-gray-100">Admin User</h2>
            <p className="text-sm text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-900/50 text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-gray-500 shadow-inner transition-all duration-300"
          />
          <svg className="w-4 h-4 absolute right-4 top-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {/* Dashboard Button */}
          <li className="relative">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                location.pathname === '/dashboard'
                  ? 'bg-gray-900/80 shadow-lg border border-gray-800/50'
                  : 'hover:bg-gray-900/40 hover:border hover:border-gray-800/30'
              }`}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>
          </li>

          {/* Management Dropdown */}
          <li className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-300 ${
                location.pathname.startsWith('/employee') || location.pathname.startsWith('/projects') || location.pathname.startsWith('/recruitment')
                  ? 'bg-gray-900/80 shadow-lg border border-gray-800/50'
                  : 'hover:bg-gray-900/40 hover:border hover:border-gray-800/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium">Management</span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <ul className="pl-4 mt-2 space-y-1">
                <li>
                  <Link
                    to="/employees"
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      location.pathname.startsWith('/employee')
                        ? 'bg-gray-900/80 shadow-lg border border-gray-800/50'
                        : 'hover:bg-gray-900/40 hover:border hover:border-gray-800/30'
                    }`}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Employees</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/projectDashboard"
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      location.pathname.startsWith('/projects')
                        ? 'bg-gray-900/80 shadow-lg border border-gray-800/50'
                        : 'hover:bg-gray-900/40 hover:border hover:border-gray-800/30'
                    }`}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium">Projects</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manage"
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      location.pathname.startsWith('/recruitment')
                        ? 'bg-gray-900/80 shadow-lg border border-gray-800/50'
                        : 'hover:bg-gray-900/40 hover:border hover:border-gray-800/30'
                    }`}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Recruitment</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800/50 bg-gradient-to-r from-black to-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <p> 2024 PK-HUB OPPS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
