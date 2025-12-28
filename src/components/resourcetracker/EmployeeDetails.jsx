import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const StatCard = ({ title, value, icon }) => (
  <div className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 sm:p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-200/50 hover:bg-white/90 transform hover:-translate-y-0.5">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 mb-1 sm:mb-2 tracking-wide uppercase truncate">{title}</p>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{value}</h3>
      </div>
    </div>
  </div>
);

const UtilizationBarChart = ({ utilizationData }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Generate year options (previous year, current year, next year)
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  // Calculate monthly data for each work type
  let monthlyData = months.map((month, index) => {
    const monthIndex = index;
    const monthUtils = utilizationData.filter(util => {
      const utilDate = new Date(util.Timesheet?.date || util.createdAt);
      return utilDate.getMonth() === monthIndex && utilDate.getFullYear() === selectedYear;
    });

    if (monthUtils.length === 0) {
      return {
        month,
        chargeable: 0,
        nonChargeable: 0,
        leave: 0,
        count: 0
      };
    }

    // Helper function to normalize worktype strings for comparison
    const normalizeWorktype = (worktype) => {
      if (!worktype) return '';
      return worktype.toString().toLowerCase().trim();
    };

    // Calculate totals for each work type with flexible matching
    let chargeableTotal = 0;
    let nonChargeableTotal = 0;
    let leaveTotal = 0;

    monthUtils.forEach(util => {
      const worktype = normalizeWorktype(util.Worktype?.worktype);
      const percentage = util.percentage || 0;

      // Handle "chargeable and non-chargeable" - split 50/50
      if (worktype === 'chargeable and non-chargeable' ||
        worktype === 'chargeable and non chargeable' ||
        worktype === 'chargeable & non-chargeable') {
        chargeableTotal += percentage * 0.5;
        nonChargeableTotal += percentage * 0.5;
      }
      // Pure chargeable
      else if (worktype === 'chargeable' || worktype === 'billable') {
        chargeableTotal += percentage;
      }
      // Pure non-chargeable
      else if (worktype === 'non-chargeable' || worktype === 'non chargeable' ||
        worktype === 'nonchargeable' || worktype === 'internal') {
        nonChargeableTotal += percentage;
      }
      // Leave
      else if (worktype === 'annual leave' || worktype === 'leave' ||
        worktype === 'annual-leave' || worktype === 'annualleave') {
        leaveTotal += percentage;
      }
      // Log unmatched types
      else if (worktype !== '') {
        console.warn(`⚠️ Unknown worktype: "${worktype}" for entry ID ${util.id}`);
      }
    });

    // Calculate the total of all utilizations for the month
    const totalUtilization = chargeableTotal + nonChargeableTotal + leaveTotal;

    // Debug: Uncomment to see monthly breakdown
    // if (monthUtils.length > 0 && index === new Date().getMonth()) {
    //   console.log(`✅ ${month} Breakdown:`, {
    //     chargeableTotal: chargeableTotal.toFixed(1),
    //     nonChargeableTotal: nonChargeableTotal.toFixed(1),
    //     leaveTotal: leaveTotal.toFixed(1),
    //     totalUtilization: totalUtilization,
    //     entriesProcessed: monthUtils.length
    //   });
    // }

    // If no utilization data, return zeros
    if (totalUtilization === 0) {
      return {
        month,
        chargeable: 0,
        nonChargeable: 0,
        leave: 0,
        count: 0
      };
    }

    // Calculate percentages as proportion of total utilization
    const chargeable = Math.round((chargeableTotal / totalUtilization) * 100);
    const nonChargeable = Math.round((nonChargeableTotal / totalUtilization) * 100);
    const leave = Math.round((leaveTotal / totalUtilization) * 100);

    return {
      month,
      chargeable,
      nonChargeable,
      leave,
      count: monthUtils.length,
      total: chargeable + nonChargeable + leave
    };
  });


  const maxValue = Math.max(...monthlyData.map(d => d.total), 100);
  const yAxisSteps = [0, 20, 40, 60, 80, 100];

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Monthly Utilization Breakdown</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-Axis Labels and Grid Lines */}
        <div className="absolute left-0 top-0 h-48 sm:h-56 lg:h-64 flex flex-col justify-between text-right pr-2 sm:pr-3 text-xs text-gray-500 font-medium">
          {yAxisSteps.reverse().map((step) => (
            <div key={step} className="relative">
              <span className="bg-white pr-1">{step}%</span>
              {/* Horizontal Grid Lines */}
              <div
                className="absolute left-12 top-1/2 transform -translate-y-1/2 border-t border-gray-100"
                style={{ width: 'calc(100% + 300px)' }}
              />
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="ml-8 sm:ml-10 lg:ml-12 relative">
          {/* Y-Axis Line */}
          <div className="absolute left-0 top-0 h-48 sm:h-56 lg:h-64 w-px bg-gray-300"></div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 sm:h-56 lg:h-64 px-2 sm:px-3 relative w-full">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center group relative h-full flex-1">
                {/* Bar Group Container - aligned to bottom */}
                <div className="flex items-end justify-center gap-0.5 h-full">
                  {/* Chargeable Bar */}
                  <div
                    className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer relative w-2 sm:w-3 lg:w-4"
                    style={{
                      height: data.chargeable > 0
                        ? `${data.chargeable}%`
                        : '2px',
                      minHeight: '2px'
                    }}
                  >
                    {/* Value Label on Top of Bar */}
                    {data.chargeable > 10 && (
                      <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 bg-white/90 px-1 py-0.5 rounded text-center shadow-sm hidden lg:block whitespace-nowrap">
                        {data.chargeable}%
                      </div>
                    )}
                  </div>

                  {/* Non-Chargeable Bar */}
                  <div
                    className="bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-sm shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer relative w-2 sm:w-3 lg:w-4"
                    style={{
                      height: data.nonChargeable > 0
                        ? `${data.nonChargeable}%`
                        : '2px',
                      minHeight: '2px'
                    }}
                  >
                    {/* Value Label on Top of Bar */}
                    {data.nonChargeable > 10 && (
                      <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 bg-white/90 px-1 py-0.5 rounded text-center shadow-sm hidden lg:block whitespace-nowrap">
                        {data.nonChargeable}%
                      </div>
                    )}
                  </div>

                  {/* Leave Bar */}
                  <div
                    className="bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-sm shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer relative w-2 sm:w-3 lg:w-4"
                    style={{
                      height: data.leave > 0
                        ? `${data.leave}%`
                        : '2px',
                      minHeight: '2px'
                    }}
                  >
                    {/* Value Label on Top of Bar */}
                    {data.leave > 10 && (
                      <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 bg-white/90 px-1 py-0.5 rounded text-center shadow-sm hidden lg:block whitespace-nowrap">
                        {data.leave}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Tooltip */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-md py-2 px-3 whitespace-nowrap shadow-lg mb-2">
                    <div className="font-medium text-center mb-1">{data.month}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300">Chargeable:</span>
                        </div>
                        <span className="text-white font-medium">{data.chargeable}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-300">Non-Chargeable:</span>
                        </div>
                        <span className="text-white font-medium">{data.nonChargeable}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          <span className="text-gray-300">Leave:</span>
                        </div>
                        <span className="text-white font-medium">{data.leave}%</span>
                      </div>
                      <div className="border-t border-gray-600 pt-1 mt-1">
                        <div className="text-gray-300 text-center">{data.count} entries</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            ))}
          </div>

          {/* X-Axis Line */}
          <div className="h-px bg-gray-300"></div>

          {/* X-Axis Labels - Below the axis line */}
          <div className="flex justify-between mt-2 px-2 sm:px-3">
            {monthlyData.map((data, index) => (
              <div key={index} className="text-center flex-1">
                <div className="text-xs font-medium text-gray-600">{data.month}</div>
                {data.count > 0 && (
                  <div className="text-xs text-gray-400 hidden sm:block">{data.count}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Y-Axis Title */}
        <div className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 -rotate-90">
          <span className="text-xs text-gray-500">Utilization %</span>
        </div>
      </div>

      {/* Enhanced Legend and Stats */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center gap-3 lg:gap-0 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-green-400 rounded-sm"></div>
              <span className="text-gray-600 font-medium"> Chargeable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-600 to-orange-400 rounded-sm"></div>
              <span className="text-gray-600 font-medium"> Non-Chargeable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-700 to-gray-500 rounded-sm"></div>
              <span className="text-gray-600 font-medium">Leave</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-gray-500">
              Peak Month: <span className="font-medium text-gray-700">
                {monthlyData.reduce((max, curr) => curr.total > max.total ? curr : max, { month: 'N/A', total: 0 }).month}
              </span>
            </span>
            <span className="text-gray-500">
              Total Entries: <span className="font-medium text-gray-700">
                {monthlyData.reduce((sum, m) => sum + m.count, 0)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* No Data State */}
      {monthlyData.every(m => m.count === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-2xl sm:text-3xl mb-2"></div>
            <p className="text-gray-500 text-sm sm:text-base font-medium">No utilization data available for {selectedYear}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Three Smaller Charts Component for Last 3 Months
const ThreeMonthCharts = ({ utilizationData }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get last 3 months from current date (may cross year boundaries)
  const getLastThreeMonths = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const lastThree = [];

    for (let i = 2; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = monthIndex > currentMonth ? currentYear - 1 : currentYear;
      lastThree.push({ month: months[monthIndex], monthIndex, year });
    }
    return lastThree;
  };

  const lastThreeMonths = getLastThreeMonths();

  // Helper function to normalize worktype strings
  const normalizeWorktype = (worktype) => {
    if (!worktype) return '';
    return worktype.toString().toLowerCase().trim();
  };

  // Calculate data for each month
  const calculateMonthData = (monthIndex, year, type) => {
    const monthUtils = utilizationData.filter(util => {
      const utilDate = new Date(util.Timesheet?.date || util.createdAt);
      return utilDate.getMonth() === monthIndex && utilDate.getFullYear() === year;
    });

    if (monthUtils.length === 0) return 0;

    let total = 0;
    monthUtils.forEach(util => {
      const worktype = normalizeWorktype(util.Worktype?.worktype);
      const percentage = util.percentage || 0;

      if (type === 'chargeable') {
        if (worktype === 'chargeable and non-chargeable' ||
          worktype === 'chargeable and non chargeable' ||
          worktype === 'chargeable & non-chargeable') {
          total += percentage * 0.5;
        } else if (worktype === 'chargeable' || worktype === 'billable') {
          total += percentage;
        }
      } else if (type === 'nonChargeable') {
        if (worktype === 'chargeable and non-chargeable' ||
          worktype === 'chargeable and non chargeable' ||
          worktype === 'chargeable & non-chargeable') {
          total += percentage * 0.5;
        } else if (worktype === 'non-chargeable' || worktype === 'non chargeable' ||
          worktype === 'nonchargeable' || worktype === 'internal') {
          total += percentage;
        }
      } else if (type === 'leave') {
        if (worktype === 'annual leave' || worktype === 'leave' ||
          worktype === 'annual-leave' || worktype === 'annualleave') {
          total += percentage;
        }
      }
    });

    // Calculate percentage of total utilization
    const totalUtilization = monthUtils.reduce((sum, util) => sum + (util.percentage || 0), 0);
    return totalUtilization > 0 ? Math.round((total / totalUtilization) * 100) : 0;
  };

  // Single Chart Component
  const MiniChart = ({ title, data, color, bgColor }) => {
    const maxValue = Math.max(...data.map(d => d.value), 100);
    const yAxisSteps = [0, 25, 50, 75, 100];

    return (
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 h-full">
        <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-800">{title}</h3>

        <div className="relative">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 h-32 sm:h-40 flex flex-col justify-between text-right pr-2 text-xs text-gray-500 font-medium">
            {yAxisSteps.reverse().map((step) => (
              <div key={step}>
                <span className="bg-white pr-1">{step}%</span>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="ml-6 sm:ml-8 relative">
            {/* Y-Axis Line */}
            <div className="absolute left-0 top-0 h-32 sm:h-40 w-px bg-gray-300"></div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between h-32 sm:h-40 px-2 relative">
              {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center group relative h-full flex-1">
                  <div className="flex items-end justify-center h-full w-full">
                    <div
                      className={`${bgColor} rounded-t-sm shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer relative w-3 sm:w-4 lg:w-5`}
                      style={{
                        height: item.value > 0 ? `${(item.value / maxValue) * 100}%` : '2px',
                        minHeight: '2px'
                      }}
                    >
                      {item.value > 10 && (
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 bg-white/90 px-1 py-0.5 rounded text-center shadow-sm hidden sm:block whitespace-nowrap">
                          {item.value}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-md py-2 px-3 whitespace-nowrap shadow-lg mb-2">
                      <div className="font-medium text-center mb-1">{item.month}</div>
                      <div className="text-center font-medium">{item.value}%</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-Axis Line */}
            <div className="h-px bg-gray-300"></div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 px-2">
              {data.map((item, index) => (
                <div key={index} className="text-center flex-1">
                  <div className="text-xs font-medium text-gray-600">{item.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Prepare data for each chart
  const chargeableData = lastThreeMonths.map(({ month, monthIndex, year }) => ({
    month,
    value: calculateMonthData(monthIndex, year, 'chargeable')
  }));

  const nonChargeableData = lastThreeMonths.map(({ month, monthIndex, year }) => ({
    month,
    value: calculateMonthData(monthIndex, year, 'nonChargeable')
  }));

  const leaveData = lastThreeMonths.map(({ month, monthIndex, year }) => ({
    month,
    value: calculateMonthData(monthIndex, year, 'leave')
  }));

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200 w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Last 3 Months Breakdown</h2>
        <p className="text-sm text-gray-500 mt-1">
          {lastThreeMonths.map(m => m.month).join(', ')} {lastThreeMonths[0].year !== lastThreeMonths[2].year
            ? `${lastThreeMonths[0].year}-${lastThreeMonths[2].year}`
            : lastThreeMonths[0].year}
        </p>
      </div>

      {/* Three Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniChart
          title=" Chargeable"
          data={chargeableData}
          color="from-green-600 to-green-400"
          bgColor="bg-gradient-to-t from-green-600 to-green-400"
        />
        <MiniChart
          title=" Non-Chargeable"
          data={nonChargeableData}
          color="from-orange-600 to-orange-400"
          bgColor="bg-gradient-to-t from-orange-600 to-orange-400"
        />
        <MiniChart
          title=" Leave"
          data={leaveData}
          color="from-gray-700 to-gray-500"
          bgColor="bg-gradient-to-t from-gray-700 to-gray-500"
        />
      </div>
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
  const [chartView, setChartView] = useState('three-month'); // 'full' or 'three-month'

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
            'http://localhost:5001/api/employees/find-by-email',
            { email: parsedUser.email }
          );
          targetEmployee = response.data;
          setEmployee(response.data);
        }

        // Fetch utilization data for this employee
        if (targetEmployee?.id) {
          try {
            const utilizationResponse = await axios.get(
              `http://localhost:5001/api/utilization/employee/${targetEmployee.id}`
            );
            setUtilizations(utilizationResponse.data || []);
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


  // Get current project information
  const getCurrentProjectInfo = () => {
    if (utilizations.length === 0) {
      return { projectName: 'No Project Assigned', expectedFinishDate: 'N/A', workType: 'none' };
    }

    // Sort utilizations by date (most recent first)
    const sortedUtils = [...utilizations].sort((a, b) => {
      const dateA = new Date(a.Timesheet?.date || a.createdAt);
      const dateB = new Date(b.Timesheet?.date || b.createdAt);
      return dateB - dateA;
    });

    // Find the first utilization with a non-empty projectname, ignoring placeholders
    // This matches the logic in ConsolidatedTracker and ResourceTracker
    const validProjectUtil = sortedUtils.find(util => {
      const name = util.projectname?.trim();
      return name &&
        name !== '' &&
        name !== 'Resource Tracker' &&
        name.toLowerCase() !== 'resource tracker' &&
        name.toLowerCase() !== 'non project assigned' &&
        name.toLowerCase() !== 'no project';
    });

    // Use the latest util for date/worktype, but the valid project util for the name
    const latestUtil = sortedUtils[0];

    // If we found a valid project in history, use it. Otherwise default.
    const displayProjectName = validProjectUtil?.projectname || 'No Project Assigned';

    // Find expected finish date similarly (ignoring empty or ' ')
    const validDurationUtil = sortedUtils.find(util => {
      const duration = util.expected_finish_date;
      return duration && duration !== ' ' && duration.toLowerCase() !== 'tbd';
    });

    return {
      projectName: displayProjectName,
      expectedFinishDate: validDurationUtil?.expected_finish_date || latestUtil.expected_finish_date || 'N/A',
      workType: latestUtil.Worktype?.worktype || 'unknown',
      percentage: latestUtil.percentage || 0,
      date: latestUtil.Timesheet?.date || latestUtil.createdAt
    };
  };


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
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <SidebarToggle onToggle={toggleSidebar} />
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ring-2 sm:ring-4 ring-white/50">
                  <span className="text-lg sm:text-xl text-white font-semibold">
                    {employee.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 sm:border-3 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight truncate">
                    {employee.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2 truncate">


                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1 sm:mt-2">
                  <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-xs sm:text-sm font-semibold border border-green-200/50 shadow-sm">
                    ✅ {employee.employmentStatus || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Prominent Project Status Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="text-white">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Current Project Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Project Name */}
                <div className="min-w-0">
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-2">Project Name</p>
                  <p className="text-sm sm:text-base font-bold truncate">{currentProject.projectName}</p>
                </div>


                {/* Work Type */}
                <div className="min-w-0">
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-2">Work Type</p>
                  <span
                    className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold ${currentProject.workType === 'chargeable'
                      ? 'bg-green-500/90 text-white'
                      : currentProject.workType === 'non-chargeable'
                        ? 'bg-yellow-500/90 text-white'
                        : currentProject.workType === 'annual leave'
                          ? 'bg-red-500/90 text-white'
                          : 'bg-gray-500/90 text-white'
                      }`}
                  >
                    {currentProject.workType === 'chargeable'
                      ? ' Billable'
                      : currentProject.workType === 'non-chargeable'
                        ? ' Internal'
                        : currentProject.workType === 'annual leave'
                          ? ' Leave'
                          : ' Billable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Overview</h2>
          <p className="text-sm sm:text-base text-gray-600">Quick insights about the employee</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            title="Solution"
            value={employee.solution || 'Not Assigned'}
            icon=""
          />
          <StatCard
            title="Position"
            value={employee.position || employee.role || 'Employee'}
            icon=""
          />
          <StatCard
            title="Expected Leave Status"
            value={employee.leaves_expected === "0" ? "No Leave Expected" : (employee.leaves_expected ?? "leaves expected")}
            icon=""
          />
          <StatCard
            title="Employment Status"
            value={employee.employmentStatus || 'Active'}
            icon=""
          />
        </div>

        {/* Enhanced Main Content */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Analytics Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600">Detailed utilization metrics and performance insights</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6">
            {/* Employee Information - Enhanced */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl p-4 sm:p-5 border border-blue-100/50">
                <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Employee Details
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name</p>
                    <p className="text-sm text-gray-900 font-semibold group-hover:text-blue-600 transition-colors truncate">{employee.name}</p>
                  </div>
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm text-gray-900 font-semibold truncate group-hover:text-blue-600 transition-colors">{employee.email}</p>
                  </div>
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Location</p>
                    <p className="text-sm text-gray-900 font-semibold group-hover:text-blue-600 transition-colors truncate">{employee.location || 'Not Assigned'}</p>
                  </div>
                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Current Project</p>
                    <p className="text-sm text-gray-900 font-semibold group-hover:text-blue-600 transition-colors truncate">{currentProject.projectName}</p>
                  </div>

                  <div className="group">
                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Project Status</p>
                    <p className="text-sm text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                      {currentProject.workType === 'chargeable' ? 'Billable' :
                        currentProject.workType === 'non-chargeable' ? 'Internal' :
                          currentProject.workType === 'annual leave' ? ' Leave' :
                            'Chargeable + non chargeable'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section - Enhanced and Larger */}
            <div className="flex-1 w-full lg:px-4">
              {/* Toggle Buttons */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => setChartView('full')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${chartView === 'full'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Full Year View
                </button>
                <button
                  onClick={() => setChartView('three-month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${chartView === 'three-month'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Last 3 Months
                </button>
              </div>

              {/* Chart Display */}
              {chartView === 'full' ? (
                <UtilizationBarChart utilizationData={utilizations} />
              ) : (
                <ThreeMonthCharts utilizationData={utilizations} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails; 