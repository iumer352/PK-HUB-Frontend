import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                WorkFlow
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-b-2 border-indigo-500 text-gray-900'
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/add"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/add')
                    ? 'border-b-2 border-indigo-500 text-gray-900'
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Add Employee
              </Link>
              <Link
                to="/view"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/view')
                    ? 'border-b-2 border-indigo-500 text-gray-900'
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                View Employees
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="ml-3 relative">
              <div>
                <button className="bg-white flex text-sm rounded-full focus:outline-none">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
