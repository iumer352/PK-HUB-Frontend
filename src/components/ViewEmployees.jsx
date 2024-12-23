import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

const TODAY = new Date();

const ViewEmployees = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthView, setIsMonthView] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    role: '',
    department: '',
    date: null
  });

  const tableStyles = {
    container: {
      maxWidth: '100%',
      overflowX: 'auto',
      position: 'relative'
    },
    stickyColumn: {
      position: 'sticky',
      left: 0,
      zIndex: 20,
      backgroundColor: 'white',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    }
  };

  const handleDateChange = (direction) => {
    setCurrentDate(prevDate => {
      if (isMonthView) {
        return direction === 'next' 
          ? addMonths(prevDate, 1)
          : subMonths(prevDate, 1);
      } else {
        return direction === 'next'
          ? addDays(prevDate, 7)
          : addDays(prevDate, -7);
      }
    });
  };

  // Calculate dates based on current view
  const dates = useMemo(() => {
    if (isMonthView) {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = [];
      let currentDay = start;
      
      while (currentDay <= end) {
        days.push(currentDay);
        currentDay = addDays(currentDay, 1);
      }
      return days;
    } else {
      return Array.from({ length: 7 }, (_, i) => 
        addDays(startOfWeek(currentDate), i)
      );
    }
  }, [currentDate, isMonthView]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      role: '',
      department: '',
      date: null
    });
  };

  // Filter employees based on search criteria
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const nameMatch = employee.name?.toLowerCase().includes(filters.name.toLowerCase());
      const roleMatch = !filters.role || employee.role === filters.role;
      const departmentMatch = !filters.department || employee.department === filters.department;
      return nameMatch && roleMatch && departmentMatch;
    });
  }, [employees, filters]);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Get unique departments and roles for filters
  const departments = [...new Set(employees.map(emp => emp.department))];
  const roles = [...new Set(employees.map(emp => emp.role))];

  const isDateInProject = (date, projects) => {
    return projects.some(project => {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const checkDate = new Date(date);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <select
              name="department"
              id="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option key="all-departments" value="">All Departments</option>
              {departments.map(dept => (
                <option key={`dept-${dept}`} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              id="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option key="all-roles" value="">All Roles</option>
              {roles.map(role => (
                <option key={`role-${role}`} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleDateChange('prev')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, isMonthView ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
          </h2>
          <button
            onClick={() => handleDateChange('next')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setIsMonthView(!isMonthView)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isMonthView ? 'Week View' : 'Month View'}
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow overflow-x-auto" style={tableStyles.container}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={tableStyles.stickyColumn}>
                Employee
              </th>
              {dates.map((date, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-600">{format(date, 'EEE')}</span>
                    <span className={`text-lg ${isSameDay(date, TODAY) ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredEmployees.map((employee, empIndex) => (
              <tr key={employee._id || `emp-${empIndex}`} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="sticky left-0 z-10 bg-white whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900" style={tableStyles.stickyColumn}>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {employee.name ? employee.name.split(' ').map(n => n[0]).join('') : ''}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-gray-500 text-xs">
                        {employee.role} • {employee.department}
                      </div>
                    </div>
                  </div>
                </td>
                {dates.map((date, dateIndex) => {
                  const isBusy = isDateInProject(date, employee.projects || []);
                  return (
                    <td
                      key={`${employee._id || empIndex}-${format(date, 'yyyy-MM-dd')}`}
                      className="whitespace-nowrap px-6 py-4 text-sm text-center"
                    >
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        isBusy 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {isBusy ? 'Busy' : 'Free'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewEmployees;
