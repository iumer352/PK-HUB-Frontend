import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const AvailableTeamMembers = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [employees, setEmployees] = useState([]);
  const [employeeUtilizations, setEmployeeUtilizations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(months[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchEmployeesAndUtilizations = async () => {
      try {
        // Fetch all employees
        const response = await axios.get('/rt/employees');
        const employeesData = response.data;
        setEmployees(employeesData);

        // Fetch utilization data for each employee
        const utilizationsData = {};
        for (const employee of employeesData) {
          try {
            const utilizationResponse = await axios.get(
              `/rt/utilization/employee/${employee.id}`
            );
            utilizationsData[employee.id] = utilizationResponse.data || [];
          } catch (utilError) {
            console.error(`Error fetching utilization for employee ${employee.id}:`, utilError);
            utilizationsData[employee.id] = [];
          }
        }
        setEmployeeUtilizations(utilizationsData);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesAndUtilizations();
  }, []);

  const handleEmployeeClick = (employee) => {
    // Navigate to employee details page with employee data
    navigate('/employee-dashboard', {
      state: { employee }
    });
  };

  const handleBackToDashboard = () => {
    navigate('/employee-dashboard');
  };

  // Helper function to check if employee is non-chargeable in CURRENT WEEK
  const isNonChargeableThisWeek = (employeeId) => {
    const utilizations = employeeUtilizations[employeeId] || [];

    // 1. Calculate the start date of the current week (Sunday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - day; // Adjust to Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);

    // Format to YYYY-MM-DD to match backend string comparison
    const yyyy = startOfWeek.getFullYear();
    const mm = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const dd = String(startOfWeek.getDate()).padStart(2, '0');
    const currentWeekStartDate = `${yyyy}-${mm}-${dd}`;

    // 2. Find all records for this specific date
    const weekUtils = utilizations.filter(util =>
      util.Timesheet?.date === currentWeekStartDate
    );

    if (weekUtils.length === 0) {
      // If no data exists for this week, we assume they are NOT strictly "available/non-chargeable"
      // or we can assume they are available. Usually "Available" list implies "Explicitly Internal/Bench".
      // Let's assume false to be safe, only showing those explicitly marked non-chargeable.
      return false;
    }

    // 3. Strict "Max ID" Logic: Find the utilization record with the highest ID
    const latestUtil = weekUtils.reduce((latest, current) => {
      return current.id > latest.id ? current : latest;
    });

    // 4. Check if the LATEST record is 'non-chargeable'
    return latestUtil.Worktype?.worktype === 'non-chargeable';
  };

  // Filter for non-billable employees only (Current Week)
  const nonBillableEmployees = employees.filter(employee => {
    return isNonChargeableThisWeek(employee.id);
  });

  // Group employees by department
  const employeesByDepartment = nonBillableEmployees.reduce((acc, employee) => {
    const dept = employee.department || 'Other';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(employee);
    return acc;
  }, {});

  // Sort departments alphabetically
  const sortedDepartments = Object.keys(employeesByDepartment).sort();

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available team members...</p>
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
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarToggle onToggle={toggleSidebar} />
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-xl text-white">🆓</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Available Team Members
                </h1>
                <p className="text-gray-600">{nonBillableEmployees.length} non-billable resources</p>
              </div>
            </div>

            {/* Current Week Indicator */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <span className="text-sm font-medium text-blue-800">
                  Showing data for current week: {(() => {
                    const today = new Date();
                    const day = today.getDay(); // 0 is Sunday
                    const diff = today.getDate() - day; // Adjust to Sunday
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(diff);
                    return startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  })()} - {(() => {
                    const today = new Date();
                    const day = today.getDay();
                    const diff = today.getDate() - day + 6; // Adjust to Saturday
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(diff);
                    return endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List Section */}
      <div className="w-full px-6 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Resources by Department</h2>
          <p className="text-gray-600">
            Showing team members who are non-billable for the current week · Click on any team member to view their details
          </p>
        </div>

        {/* Department Sections */}
        {sortedDepartments.map((department) => (
          <div key={department} className="mb-6">
            {/* Department Header */}
            <div className="mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{department}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {employeesByDepartment[department].length} {employeesByDepartment[department].length === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>

            {/* Department Employees */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="col-span-2">Employee</div>
                <div>Position</div>
                <div>Expertise</div>
                <div>Email</div>
                <div>Status</div>
              </div>

              {employeesByDepartment[department].map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleEmployeeClick(employee)}
                  className="group grid grid-cols-6 gap-4 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer items-center"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-white font-medium">
                        {employee.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {employee.name}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">{employee.position}</div>
                  <div className="text-sm text-gray-600">{employee.expertise}</div>
                  <div className="text-sm text-gray-600 truncate">{employee.email}</div>
                  <div className="text-sm">
                    {(() => {
                      const isOnLeave = employee.leaves_expected && employee.leaves_expected !== "0";
                      if (isOnLeave) {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Leaves Expected
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            Available
                          </span>
                        );
                      }
                    })()}
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}

        {nonBillableEmployees.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">🆓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Resources Found</h3>
            <p className="text-gray-600">
              There are no non-billable employees in the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTeamMembers; 