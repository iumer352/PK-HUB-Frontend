import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/employees');
        setEmployees(response.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeClick = (employee) => {
    // Navigate to employee details page with employee data
    navigate('/employee-dashboard', { 
      state: { employee } 
    });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Team</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-auto">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <SidebarToggle onToggle={toggleSidebar} />
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/50">
                <span className="text-2xl text-white font-semibold">👥</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  Team Utilizations
                </h1>
                <p className="text-lg text-gray-600">View and manage team member utilization data</p>
                <p className="text-sm text-gray-500">{employees.length} team members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List Section */}
      <div className="w-full px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h2>
          <p className="text-gray-600">Click on any team member to view their detailed utilization analytics</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50/50 border-b border-gray-200/50 text-sm font-semibold text-gray-700">
            <div className="col-span-2">Employee</div>
            <div>Position</div>
            <div>Department</div>
            <div>Expertise</div>
            <div>Email</div>
            <div>Leave Status</div>
            <div className="text-center">ID</div>
          </div>
          {employees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => handleEmployeeClick(employee)}
              className="group grid grid-cols-8 gap-4 p-4 hover:bg-blue-50/30 border-b border-gray-100/50 last:border-b-0 transition-all duration-200 cursor-pointer items-center"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                  <span className="text-sm text-white font-semibold">
                    {employee.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {employee.name}
                  </h3>
                </div>
              </div>
              <div className="text-sm text-gray-700 font-medium">{employee.position}</div>
              <div className="text-sm text-gray-600">{employee.department}</div>
              <div className="text-sm text-gray-600">{employee.expertise}</div>
              <div className="text-sm text-gray-600 truncate">{employee.email}</div>
              <div className="text-sm">
                {employee.leaves_expected && employee.leaves_expected !== "0" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    🏖️ {employee.leaves_expected}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ✅ Active
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-gray-700">#{employee.id}</span>
              </div>
            </div>
          ))}
        </div>

        {employees.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Team Members Found</h3>
            <p className="text-gray-600">There are no employees in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList; 