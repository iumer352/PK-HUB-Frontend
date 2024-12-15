import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

const TODAY = new Date('2024-12-16T01:10:07+05:00');

const ViewEmployees = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthView, setIsMonthView] = useState(false);

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

  // Static employee data
  const [employees] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'Developer',
      projects: [
        {
          name: 'E-commerce Platform',
          startDate: '2024-12-16',
          endDate: '2024-12-20'
        }
      ],
      availability: [
        { date: '2024-12-16', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-17', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-18', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-19', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-20', startTime: '09:00', endTime: '17:00' }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Designer',
      projects: [
        {
          name: 'Mobile App Redesign',
          startDate: '2024-12-16',
          endDate: '2024-12-20'
        }
      ],
      availability: [
        { date: '2024-12-16', startTime: '10:00', endTime: '18:00' },
        { date: '2024-12-18', startTime: '10:00', endTime: '18:00' },
        { date: '2024-12-20', startTime: '10:00', endTime: '18:00' }
      ]
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Manager',
      projects: [
        {
          name: 'Project Management System',
          startDate: '2024-12-16',
          endDate: '2024-12-20'
        }
      ],
      availability: [
        { date: '2024-12-16', startTime: '08:00', endTime: '16:00' },
        { date: '2024-12-17', startTime: '08:00', endTime: '16:00' },
        { date: '2024-12-19', startTime: '08:00', endTime: '16:00' },
        { date: '2024-12-20', startTime: '08:00', endTime: '16:00' }
      ]
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'QA',
      projects: [
        {
          name: 'Testing Framework Implementation',
          startDate: '2024-12-17',
          endDate: '2024-12-20'
        }
      ],
      availability: [
        { date: '2024-12-17', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-18', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-19', startTime: '09:00', endTime: '17:00' },
        { date: '2024-12-20', startTime: '09:00', endTime: '17:00' }
      ]
    }
  ]);

  const [filters, setFilters] = useState({
    name: '',
    role: '',
    date: null
  });

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
      date: null
    });
  };

  // Filter employees based on search criteria
  const filteredEmployees = employees.filter(employee => {
    const nameMatch = employee.name.toLowerCase().includes(filters.name.toLowerCase());
    const roleMatch = !filters.role || employee.role === filters.role;
    const dateMatch = !filters.date || employee.availability.some(a => 
      isSameDay(parseISO(a.date), parseISO(filters.date))
    );
    return nameMatch && roleMatch && dateMatch;
  });

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(employees.map(emp => emp.role))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Employee Schedule</h1>
        <p className="text-gray-600 mt-2">View and manage employee schedules and projects</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Toggle Switch */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isMonthView}
                onChange={() => setIsMonthView(!isMonthView)}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {isMonthView ? 'Month View' : 'Week View'}
              </span>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDateChange('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-700">
              {format(currentDate, isMonthView ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
            </span>
            <button
              onClick={() => handleDateChange('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Employee
                    </th>
                    {dates.map((date, index) => (
                      <th
                        key={index}
                        className={`px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[150px] ${
                          isSameDay(date, TODAY) ? 'bg-blue-50' : ''
                        }`}
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
                    <tr key={empIndex} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="sticky left-0 z-10 bg-white whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                            <div className="text-gray-500 text-xs">{employee.role}</div>
                          </div>
                        </div>
                      </td>
                      {dates.map((date, dateIndex) => {
                        const daySchedule = employee.availability.find(a => 
                          isSameDay(parseISO(a.date), date)
                        );
                        
                        return (
                          <td
                            key={dateIndex}
                            className={`px-4 py-4 text-sm text-gray-900 ${
                              isSameDay(date, TODAY) ? 'bg-blue-50' : ''
                            }`}
                          >
                            {daySchedule ? (
                              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="font-medium text-blue-800">{daySchedule.startTime} - {daySchedule.endTime}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployees;
