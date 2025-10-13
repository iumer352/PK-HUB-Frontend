import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const StatCard = ({ title, value, icon }) => (
  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:border-blue-200/50 hover:bg-white/90 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-500 mb-3 tracking-wide uppercase">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</h3>
      </div>
      <div className="ml-4 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 group-hover:scale-110">
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  </div>
);

const UtilizationBarChart = ({ utilizationData }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate monthly averages
  const monthlyData = months.map((month, index) => {
    const monthIndex = index;
    const monthUtils = utilizationData.filter(util => {
      const utilDate = new Date(util.Timesheet?.date || util.createdAt);
      return utilDate.getMonth() === monthIndex;
    });
    
    if (monthUtils.length === 0) return { month, average: 0, count: 0 };
    
    const total = monthUtils.reduce((sum, util) => sum + (util.percentage || 0), 0);
    const average = total / monthUtils.length;
    
    return { month, average: Math.round(average), count: monthUtils.length };
  });
  
  const maxValue = Math.max(...monthlyData.map(d => d.average), 100);
  const yAxisSteps = [0, 20, 40, 60, 80, 100];
  
    return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 w-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Utilization Overview</h2>
      
      {/* Chart Container */}
      <div className="relative">
        {/* Y-Axis Labels and Grid Lines */}
                 <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-right pr-2 text-xs text-gray-500 font-medium">
           {yAxisSteps.reverse().map((step) => (
             <div key={step} className="relative">
               <span className="bg-white pr-1">{step}%</span>
               {/* Horizontal Grid Lines */}
               <div 
                 className="absolute left-10 top-1/2 transform -translate-y-1/2 border-t border-gray-100"
                 style={{ width: 'calc(100% + 200px)' }}
               />
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
                 <div className="ml-10 relative">
           {/* Y-Axis Line */}
           <div className="absolute left-0 top-0 h-48 w-px bg-gray-300"></div>
           
           {/* Bar Chart */}
           <div className="flex items-end justify-center space-x-3 h-48 px-2 relative w-full">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center group">
                {/* Bar Container */}
                                 <div className="relative flex items-end h-40 mb-1">
                   <div 
                     className="bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 rounded-t-md shadow-sm transition-all duration-300 hover:shadow-md group-hover:from-blue-600 group-hover:via-blue-500 group-hover:to-blue-400 cursor-pointer relative transform hover:scale-105"
                     style={{ 
                       height: `${Math.max((data.average / 100) * 160, 3)}px`,
                       width: '16px'
                     }}
                  >
                                         {/* Value Label on Top of Bar (only for larger values) */}
                     {data.average > 15 && (
                       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 bg-white/90 px-1 py-0.5 rounded text-center shadow-sm">
                         {data.average}%
                       </div>
                     )}
                    
                    {/* Enhanced Tooltip */}
                                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                       <div className="bg-gray-900 text-white text-xs rounded-md py-1.5 px-2 whitespace-nowrap shadow-lg">
                         <div className="font-medium">{data.month}</div>
                         <div className="text-gray-300">{data.average}% avg</div>
                         <div className="text-gray-300">{data.count} entries</div>
                       </div>
                       <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-gray-900"></div>
                     </div>
                  </div>
                </div>
                
                {/* X-Axis Labels */}
                                 <div className="text-center">
                   <div className="text-xs font-medium text-gray-600">{data.month}</div>
                   {data.count > 0 && (
                     <div className="text-xs text-gray-400">{data.count}</div>
                   )}
                 </div>
              </div>
            ))}
          </div>
          
          {/* X-Axis Line */}
                     <div className="h-px bg-gray-300 mt-1"></div>
         </div>
         
         {/* Axis Titles */}
         <div className="flex justify-between items-end mt-2 ml-10">
           <span className="text-xs text-gray-500">Months</span>
         </div>
         
         {/* Y-Axis Title */}
         <div className="absolute left-1 top-1/2 transform -translate-y-1/2 -rotate-90">
           <span className="text-xs text-gray-500">%</span>
         </div>
      </div>
      
             {/* Compact Legend and Stats */}
       <div className="mt-4 pt-3 border-t border-gray-100">
         <div className="flex flex-wrap justify-between items-center text-xs">
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-1">
               <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-300 rounded-sm"></div>
               <span className="text-gray-600">Monthly Averages</span>
             </div>
           </div>
           
           <div className="flex items-center space-x-4">
             <span className="text-gray-500">
               Peak: <span className="font-medium text-gray-700">
                 {monthlyData.reduce((max, curr) => curr.average > max.average ? curr : max, { month: 'N/A', average: 0 }).month}
               </span>
             </span>
             <span className="text-gray-500">
               Overall: <span className="font-medium text-gray-700">
                 {utilizationData.length > 0 
                   ? Math.round(utilizationData.reduce((sum, util) => sum + (util.percentage || 0), 0) / utilizationData.length)
                   : 0}%
               </span>
             </span>
           </div>
         </div>
       </div>
      
             {/* No Data State */}
       {utilizationData.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 rounded-lg">
           <div className="text-center">
             <div className="text-gray-400 text-2xl mb-1">📈</div>
             <p className="text-gray-500 text-sm font-medium">No data available</p>
           </div>
         </div>
       )}
    </div>
  );
};

const UtilizationLineChart = ({ utilizationData }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate monthly averages
  const monthlyData = months.map((month, index) => {
    const monthIndex = index;
    const monthUtils = utilizationData.filter(util => {
      const utilDate = new Date(util.Timesheet?.date || util.createdAt);
      return utilDate.getMonth() === monthIndex;
    });
    
    if (monthUtils.length === 0) return { month, average: 0, count: 0 };
    
    const total = monthUtils.reduce((sum, util) => sum + (util.percentage || 0), 0);
    const average = total / monthUtils.length;
    
    return { month, average: Math.round(average), count: monthUtils.length };
  });
  
  const yAxisSteps = [0, 20, 40, 60, 80, 100];
  
  // Generate SVG path for the line graph
  const generateLinePath = () => {
    const validData = monthlyData.filter(data => data.average > 0);
    if (validData.length === 0) return '';
    
    const points = validData.map((data) => {
      const monthIndex = monthlyData.findIndex(m => m.month === data.month);
      const x = (monthIndex * 90 / (monthlyData.length - 1)) + 5; // 5% padding on each side
      const y = 100 - (data.average / 100 * 80) - 10; // 10% padding top/bottom
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 w-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Utilization Trend Analysis</h2>
      
      {/* Chart Container */}
      <div className="relative">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-right pr-2 text-xs text-gray-500 font-medium">
          {yAxisSteps.reverse().map((step) => (
            <div key={step} className="relative">
              <span className="bg-white pr-1">{step}%</span>
              <div 
                className="absolute left-10 top-1/2 transform -translate-y-1/2 border-t border-gray-100"
                style={{ width: 'calc(100% + 200px)' }}
              />
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="ml-10 relative">
          {/* Y-Axis Line */}
          <div className="absolute left-0 top-0 h-48 w-px bg-gray-300"></div>
          
          {/* SVG Line Graph */}
          <svg 
            className="w-full h-48"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
              </linearGradient>
            </defs>
            
            {/* Area under curve */}
            <path
              d={`${generateLinePath()} L 95,90 L 5,90 Z`}
              fill="url(#areaGradient)"
              className="opacity-70"
            />
            
            {/* Main line */}
            <path
              d={generateLinePath()}
              fill="none"
              stroke="url(#trendGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {monthlyData.map((data, index) => {
              if (data.average === 0) return null;
              const x = (index * 90 / (monthlyData.length - 1)) + 5;
              const y = 100 - (data.average / 100 * 80) - 10;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#3B82F6"
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
          
          {/* X-Axis Labels */}
          <div className="flex justify-between mt-2 px-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-gray-600">{data.month}</div>
              </div>
            ))}
          </div>
          
          {/* X-Axis Line */}
          <div className="h-px bg-gray-300 mt-1"></div>
        </div>
        
        {/* Y-Axis Title */}
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 -rotate-90">
          <span className="text-xs text-gray-500">%</span>
        </div>
      </div>
      
      {/* Legend and Stats */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
              <span className="text-gray-600">Performance Trend</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full opacity-30"></div>
              <span className="text-gray-600">Area Fill</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">
              Trend: <span className="font-medium text-gray-700">
                {monthlyData.length > 6 && monthlyData[monthlyData.length-1].average > monthlyData[5].average ? '↗ Improving' : 
                 monthlyData.length > 6 && monthlyData[monthlyData.length-1].average < monthlyData[5].average ? '↘ Declining' : '→ Stable'}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* No Data State */}
      {utilizationData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-1">📈</div>
            <p className="text-gray-500 text-sm font-medium">No trend data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Check if employee data was passed from EmployeeList
        const passedEmployee = location.state?.employee;
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        let targetEmployee;
        
        if (passedEmployee) {
          // Use the employee data passed from EmployeeList
          targetEmployee = passedEmployee;
          setEmployee(passedEmployee);
        } else {
          // Fetch employee details using the user's email (original behavior)
          const response = await axios.post(
            '/api1/employees/find-by-email',
            { email: parsedUser.email }
          );
          targetEmployee = response.data;
          setEmployee(response.data);
        }
        
        // Fetch utilization data for this employee
        if (targetEmployee?.id) {
          try {
            const utilizationResponse = await axios.get(
              `/api1/utilization/employee/${targetEmployee.id}`
            );
            setUtilizations(utilizationResponse.data || []);
            
            // Debug logging to see the data structure
            console.log('Utilizations data:', utilizationResponse.data);
            if (utilizationResponse.data && utilizationResponse.data.length > 0) {
              console.log('First utilization item:', utilizationResponse.data[0]);
              console.log('Keys in first item:', Object.keys(utilizationResponse.data[0]));
            }
          } catch (utilError) {
            console.error('Error fetching utilization data:', utilError);
            // Don't set error for utilization, just log it
            setUtilizations([]);
          }
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        if (err.response?.status === 404) {
          setError('Employee profile not found. Please contact your administrator.');
        } else {
          setError('Failed to load employee data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [navigate, location.state]);

  // Calculate current utilization stats
  const calculateUtilizationStats = () => {
    if (utilizations.length === 0) {
      return { chargeable: 0, nonChargeable: 0, leave: 0 };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthUtils = utilizations.filter(util => {
      const utilDate = new Date(util.Timesheet?.date || util.createdAt);
      return utilDate.getMonth() === currentMonth && utilDate.getFullYear() === currentYear;
    });

    if (currentMonthUtils.length === 0) {
      return { chargeable: 0, nonChargeable: 0, leave: 0 };
    }

    // Calculate total percentages for each work type
    const chargeableTotal = currentMonthUtils
      .filter(util => util.Worktype?.worktype === 'chargeable')
      .reduce((sum, util) => sum + (util.percentage || 0), 0);
    
    const nonChargeableTotal = currentMonthUtils
      .filter(util => util.Worktype?.worktype === 'non-chargeable')
      .reduce((sum, util) => sum + (util.percentage || 0), 0);
    
    const leaveTotal = currentMonthUtils
      .filter(util => util.Worktype?.worktype === 'annual leave')
      .reduce((sum, util) => sum + (util.percentage || 0), 0);

    // Calculate the total of all utilizations for the month
    const totalUtilization = chargeableTotal + nonChargeableTotal + leaveTotal;

    // If no utilization data, return zeros
    if (totalUtilization === 0) {
      return { chargeable: 0, nonChargeable: 0, leave: 0 };
    }

    // Calculate percentages as proportion of total utilization
    const chargeable = Math.round((chargeableTotal / totalUtilization) * 100);
    const nonChargeable = Math.round((nonChargeableTotal / totalUtilization) * 100);
    const leave = Math.round((leaveTotal / totalUtilization) * 100);

    return { chargeable, nonChargeable, leave };
  };

  // Get current project information
  const getCurrentProjectInfo = () => {
    if (utilizations.length === 0) {
      console.log('No utilizations found');
      return { projectName: 'No Project Assigned', expectedFinishDate: 'N/A', workType: 'none' };
    }

    // Sort utilizations by date (most recent first) and get the latest entry
    const sortedUtils = [...utilizations].sort((a, b) => {
      const dateA = new Date(a.Timesheet?.date || a.createdAt);
      const dateB = new Date(b.Timesheet?.date || b.createdAt);
      return dateB - dateA;
    });

    const latestUtil = sortedUtils[0];
    
    // Debug logging
    console.log('Latest utilization:', latestUtil);
    console.log('Expected finish date raw:', latestUtil.expected_finish_date);
    console.log('Project name:', latestUtil.projectname);
    
    return {
      projectName: latestUtil.projectname || 'No Project Assigned',
      expectedFinishDate: latestUtil.expected_finish_date || 'N/A',
      workType: latestUtil.Worktype?.worktype || 'unknown',
      percentage: latestUtil.percentage || 0,
      date: latestUtil.Timesheet?.date || latestUtil.createdAt
    };
  };


  const utilizationStats = calculateUtilizationStats();
  const currentProject = getCurrentProjectInfo();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Profile</h3>
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

  if (!employee || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">No employee data available</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-auto">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Enhanced Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <SidebarToggle onToggle={toggleSidebar} />
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/50">
                  <span className="text-2xl text-white font-semibold">
                    {employee.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                    {employee.name}
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    {employee.email || user.email}
                  </p>
                </div>
                <p className="text-lg text-gray-600 font-medium">{employee.role || user.role}</p>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200/50 shadow-sm">
                    ✅ {employee.employmentStatus || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="w-full px-8 py-8">
        {/* Prominent Project Status Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Current Project Status</h2>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Project Name</p>
                      <p className="text-2xl font-bold">{currentProject.projectName}</p>
                    </div>
                    <div className="h-12 w-px bg-white/30"></div>
                    <div>
                      <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Expected Completion</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          if (!currentProject.expectedFinishDate || currentProject.expectedFinishDate === 'N/A' || currentProject.expectedFinishDate.trim() === '') {
                            return 'N/A';
                          }
                          // Handle YYYY-MM-DD format
                          const dateStr = currentProject.expectedFinishDate.trim();
                          const date = new Date(dateStr);
                          
                          // Check if date is valid
                          if (isNaN(date.getTime())) {
                            console.log('Invalid date:', dateStr);
                            return dateStr; // Return original string if invalid
                          }
                          
                          return date.toLocaleDateString();
                        })()}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-white/30"></div>
                    <div>
                      <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Project Type</p>
                      <p className="text-2xl font-bold text-white">
                        {currentProject.workType === 'chargeable' ? 'Billable' :
                         currentProject.workType === 'non-chargeable' ? 'Non-Billable' :
                         currentProject.workType === 'annual leave' ? 'Leave' :
                         'Other'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Work Type</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    currentProject.workType === 'chargeable' ? 'bg-green-500/90 text-white' :
                    currentProject.workType === 'non-chargeable' ? 'bg-yellow-500/90 text-white' :
                    currentProject.workType === 'annual leave' ? 'bg-red-500/90 text-white' :
                    'bg-gray-500/90 text-white'
                  }`}>
                    {currentProject.workType === 'chargeable' ? '💰 Billable' :
                     currentProject.workType === 'non-chargeable' ? '⚡ Internal' :
                     currentProject.workType === 'annual leave' ? '🏖️ Leave' :
                     '📋 Other'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
          <p className="text-gray-600">Quick insights about the employee</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Department"
            value={employee.department || 'Not Assigned'}
            icon="🏢"
          />
          <StatCard 
            title="Position"
            value={employee.position || employee.role || 'Employee'}
            icon="💼"
          />
                  <StatCard 
            title="Expected Leave Status"
            value={employee.leaves_expected === "0" ? "No Leave Expected" : employee.leaves_expected}
            icon="📅"
        />
          <StatCard 
            title="Status"
            value={employee.employmentStatus || 'Active'}
            icon="✅"
          />
        </div>

        {/* Enhanced Main Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 px-8">Analytics Dashboard</h2>
          <p className="text-gray-600 px-8">Detailed utilization metrics and performance insights</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 p-8 mx-8 mb-8">
          <div className="flex items-start gap-12">
            {/* Employee Information - Enhanced */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-6 border border-blue-100/50">
                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Employee Details
                </h2>
                <div className="space-y-5">
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Full Name</p>
                    <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">{employee.name}</p>
                  </div>
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</p>
                    <p className="text-gray-900 font-semibold truncate group-hover:text-blue-600 transition-colors">{employee.email}</p>
                  </div>
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Department</p>
                    <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">{employee.department || 'Not Assigned'}</p>
                  </div>

                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Current Project</p>
                    <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">{currentProject.projectName}</p>
                  </div>
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Project Completion</p>
                    <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                      {(() => {
                        if (!currentProject.expectedFinishDate || currentProject.expectedFinishDate === 'N/A' || currentProject.expectedFinishDate.trim() === '') {
                          return 'N/A';
                        }
                        
                        // Handle YYYY-MM-DD format
                        const dateStr = currentProject.expectedFinishDate.trim();
                        const date = new Date(dateStr);
                        
                        // Check if date is valid
                        if (isNaN(date.getTime())) {
                          console.log('Invalid date:', dateStr);
                          return dateStr; // Return original string if invalid
                        }
                        
                        return date.toLocaleDateString();
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section - Enhanced */}
            <div className="flex-1 px-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <UtilizationBarChart utilizationData={utilizations} />
                <UtilizationLineChart utilizationData={utilizations} />
              </div>
            </div>

            {/* Current Month Utilization - Enhanced */}
            <div className="flex-shrink-0 w-80">
              <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-2xl p-6 border border-green-100/50">
                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Current Month
                </h2>
                <div className="space-y-6">
                  {[
                    { type: 'Chargeable', value: utilizationStats.chargeable, color: 'bg-gradient-to-r from-green-400 to-green-500', icon: '💰' },
                    { type: 'Non-Chargeable', value: utilizationStats.nonChargeable, color: 'bg-gradient-to-r from-yellow-400 to-yellow-500', icon: '⚡' },
                    { type: 'Leave', value: utilizationStats.leave, color: 'bg-gradient-to-r from-red-400 to-red-500', icon: '🏖️' }
                  ].map(({ type, value, color, icon }) => (
                    <div key={type} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{icon}</span>
                          <span className="text-sm font-bold text-gray-700">{type}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{value}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full ${color} transition-all duration-700 ease-out shadow-sm`}
                          style={{width: `${Math.min(value, 100)}%`}}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {utilizations.length === 0 && (
                  <div className="text-center mt-8 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-sm font-medium">No utilization data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails; 