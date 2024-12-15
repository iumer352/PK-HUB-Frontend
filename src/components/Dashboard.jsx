import React, { useState } from 'react';

const Dashboard = () => {
  // Sample data - replace with actual data from your backend
  const stats = {
    totalEmployees: 192,
    activeEmployees: 181,
    onLeave: 17,
    onboarding: 27
  };

  const employees = [
    { id: 1, name: 'Ryan Harris', title: 'Finance Manager', department: 'Finance', avatar: '👨‍💼' },
    { id: 2, name: 'Michael King', title: 'HR Manager', department: 'HR', avatar: '👨‍💼' },
    { id: 3, name: 'Deborah Brown', title: 'IT Helpdesk', department: 'IT', avatar: '👩‍💼' },
    { id: 4, name: 'Michelle Hopkins', title: 'Finance Specialist', department: 'Finance', avatar: '👩‍💼' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Welcome Header with Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Welcome to the Operations App
          </h1>
          <p className="mt-2 text-gray-600">Manage your operations efficiently</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          />
          <svg 
            className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Employees</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">On Leave</p>
              <p className="text-2xl font-bold text-gray-800">{stats.onLeave}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Onboarding</p>
              <p className="text-2xl font-bold text-gray-800">{stats.onboarding}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 transition-all duration-200" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Job Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 transition-all duration-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{employee.avatar}</span>
                      <span className="font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{employee.title}</td>
                  <td className="px-6 py-4 text-gray-500">{employee.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
