import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  return (
    <div className="w-[20%] min-w-[200px] bg-black text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold">Operations App</h1>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-700"></div>
          <div>
            <h2 className="font-medium">Admin User</h2>
            <p className="text-sm text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="p-4 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            Explore
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            Calendar
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/calendar"
              className={`flex items-center space-x-3 p-2 rounded-lg ${
                location.pathname === '/calendar'
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Calendar</span>
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center justify-between w-full p-2 rounded-lg ${
                location.pathname.startsWith('/dashboard')
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Dashboard</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <ul className="pl-6 mt-2 space-y-2">
                <li>
                  <Link
                    to="/dashboard/input-data"
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      location.pathname === '/dashboard/input-data'
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Input Data</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/view-data"
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      location.pathname === '/dashboard/view-data'
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Data</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-gray-800">
        <Link
          to="/settings"
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
