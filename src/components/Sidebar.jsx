import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-green-800 text-white' : 'text-gray-300 hover:bg-green-800 hover:text-white';
  };

  return (
    <div className="bg-[#0A2416] w-64 min-h-screen p-4">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-8 text-white">
        <span className="text-2xl font-bold">ScheduleFarm</span>
      </div>

      {/* User Profile */}
      <div className="bg-[#1A3426] rounded-lg p-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>
            <div className="text-white font-medium">Admin User</div>
            <div className="text-gray-400 text-sm">Manager</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <Link to="/" className={`flex items-center space-x-3 p-3 rounded-lg ${isActive('/')}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link to="/calendar" className={`flex items-center space-x-3 p-3 rounded-lg ${isActive('/calendar')}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Calendar</span>
        </Link>

        <Link to="/add" className={`flex items-center space-x-3 p-3 rounded-lg ${isActive('/add')}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Employee</span>
        </Link>

        <Link to="/view" className={`flex items-center space-x-3 p-3 rounded-lg ${isActive('/view')}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>View Employees</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
