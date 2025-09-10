import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const UtilizationReport = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [utilizations, setUtilizations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Financial data states
  const [teamFinancialData, setTeamFinancialData] = useState(null);
  const [employeeFinancialData, setEmployeeFinancialData] = useState({});
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch financial data functions
  const fetchTeamFinancialData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/cost/team/revenue');
      setTeamFinancialData(response.data);
    } catch (error) {
      console.error('Error fetching team financial data:', error);
    }
  };

  const fetchEmployeeFinancialData = async (employeeId) => {
    try {
      const { startDate, endDate } = selectedDateRange;
      const response = await axios.get(
        `http://localhost:5001/api/cost/employee/${employeeId}/revenue?startDate=${startDate}&endDate=${endDate}`
      );
      
      // Validate the response data structure
      const data = response.data;
      if (data && data.employee && data.summary && data.period && data.costRates) {
        return data;
      } else {
        console.warn(`Incomplete financial data for employee ${employeeId}:`, data);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching financial data for employee ${employeeId}:`, error);
      return null;
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all employees
        const employeesResponse = await axios.get('http://localhost:5001/api/employees');
        const employeesData = employeesResponse.data;
        setEmployees(employeesData);

        // Fetch utilization data for all employees
        const utilizationMap = {};
        
        for (const employee of employeesData) {
          try {
            const utilizationResponse = await axios.get(
              `http://localhost:5001/api/utilization/employee/${employee.id}`
            );
            utilizationMap[employee.id] = utilizationResponse.data || [];
          } catch (utilError) {
            console.error(`Failed to fetch utilization for employee ${employee.id}:`, utilError);
            utilizationMap[employee.id] = [];
          }
        }
        
        setUtilizations(utilizationMap);

        // Fetch team financial data
        await fetchTeamFinancialData();

        // Fetch individual employee financial data
        const employeeFinancialMap = {};
        for (const employee of employeesData) {
          try {
            const financialData = await fetchEmployeeFinancialData(employee.id);
            if (financialData) {
              employeeFinancialMap[employee.id] = financialData;
            }
          } catch (error) {
            console.error(`Failed to fetch financial data for employee ${employee.id}:`, error);
            // Continue with other employees even if one fails
          }
        }
        setEmployeeFinancialData(employeeFinancialMap);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedDateRange]);

  // Calculate comprehensive statistics
  const calculateOverallStats = () => {
    const stats = {
      totalEmployees: employees.length,
      totalUtilizationEntries: 0,
      averageUtilization: 0,
      averageBillableUtilization: 0,
      highestUtilization: 0,
      lowestUtilization: 100,
      totalProjects: 0,
      employeesOnLeave: 0,
      chargeableEntries: 0,
      nonChargeableEntries: 0,
      leaveEntries: 0,
      trainingEntries: 0,
      topPerformer: null,
      utilizationTrend: 'stable'
    };

    let totalUtilizationSum = 0;
    let totalEntries = 0;
    let chargeablePercentageSum = 0;
    let employeesWithChargeableData = 0;
    const employeeStats = [];
    const projectsSet = new Set();
    const currentDate = new Date();

    employees.forEach(employee => {
      const employeeUtil = utilizations[employee.id] || [];
      let employeeUtilSum = 0;
      let employeeEntries = 0;
      let employeeChargeableSum = 0;
      let employeeChargeableCount = 0;

      // Check if employee is currently on leave (7-day period check)
      if (employee.leaves_expected && employee.leaves_expected !== "0") {
        try {
          const [day, month] = employee.leaves_expected.split(' ');
          const currentYear = currentDate.getFullYear();
          const leaveStartDate = new Date(`${month} ${day}, ${currentYear}`);
          const leaveEndDate = new Date(leaveStartDate);
          leaveEndDate.setDate(leaveEndDate.getDate() + 7);

          if (leaveEndDate < currentDate) {
            leaveStartDate.setFullYear(currentYear + 1);
            leaveEndDate.setFullYear(currentYear + 1);
          }

          if (currentDate >= leaveStartDate && currentDate <= leaveEndDate) {
            stats.employeesOnLeave++;
          }
        } catch (error) {
          console.log('Error parsing leave date for', employee.name);
        }
      }

      employeeUtil.forEach(util => {
        const percentage = Number(util.percentage) || 0;
        const workType = util.Worktype?.worktype || 'chargeable';
        const projectName = util.projectname;

        employeeUtilSum += percentage;
        employeeEntries++;
        totalUtilizationSum += percentage;
        totalEntries++;

        // Track projects
        if (projectName && projectName.trim() !== '' && projectName !== ' ') {
          projectsSet.add(projectName.trim());
        }

        // Count by work type
        switch (workType) {
          case 'chargeable':
            stats.chargeableEntries++;
            employeeChargeableSum += percentage;
            employeeChargeableCount++;
            break;
          case 'non-chargeable':
            stats.nonChargeableEntries++;
            break;
          case 'annual leave':
            stats.leaveEntries++;
            break;
          case 'training':
            stats.trainingEntries++;
            break;
        }
      });

      // Calculate employee-level statistics
      if (employeeEntries > 0) {
        const avgUtilization = employeeUtilSum / employeeEntries;
        const avgChargeable = employeeChargeableCount > 0 ? 
          (employeeChargeableSum / employeeChargeableCount) : 0;

        employeeStats.push({
          employee,
          avgUtilization,
          avgChargeable,
          totalEntries: employeeEntries
        });

        // Track highest/lowest utilization
        if (avgUtilization > stats.highestUtilization) {
          stats.highestUtilization = avgUtilization;
          stats.topPerformer = employee.name;
        }
        if (avgUtilization < stats.lowestUtilization) {
          stats.lowestUtilization = avgUtilization;
        }

        // Add to chargeable average calculation
        if (employeeChargeableCount > 0) {
          chargeablePercentageSum += avgChargeable;
          employeesWithChargeableData++;
        }
      }
    });

    // Calculate final averages
    stats.totalUtilizationEntries = totalEntries;
    stats.averageUtilization = totalEntries > 0 ? (totalUtilizationSum / totalEntries) : 0;
    stats.averageBillableUtilization = employeesWithChargeableData > 0 ? 
      (chargeablePercentageSum / employeesWithChargeableData) : 0;
    stats.totalProjects = projectsSet.size;

    // Calculate utilization trend (simplified)
    const recentEntries = Object.values(utilizations).flat()
      .filter(util => {
        const utilDate = new Date(util.Timesheet?.date || util.createdAt);
        const monthsAgo = (currentDate - utilDate) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo <= 3; // Last 3 months
      });

    const oldEntries = Object.values(utilizations).flat()
      .filter(util => {
        const utilDate = new Date(util.Timesheet?.date || util.createdAt);
        const monthsAgo = (currentDate - utilDate) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo > 3 && monthsAgo <= 6; // 3-6 months ago
      });

    if (recentEntries.length > 0 && oldEntries.length > 0) {
      const recentAvg = recentEntries.reduce((sum, util) => sum + (util.percentage || 0), 0) / recentEntries.length;
      const oldAvg = oldEntries.reduce((sum, util) => sum + (util.percentage || 0), 0) / oldEntries.length;
      
      if (recentAvg > oldAvg + 5) stats.utilizationTrend = 'improving';
      else if (recentAvg < oldAvg - 5) stats.utilizationTrend = 'declining';
    }

    return { stats, employeeStats };
  };

  // Calculate monthly trends
  const calculateMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, index) => ({
      month,
      totalUtilization: 0,
      chargeableUtilization: 0,
      entries: 0,
      chargeableEntries: 0
    }));

    Object.values(utilizations).flat().forEach(util => {
      const utilDate = new Date(util.Timesheet?.date || util.createdAt);
      if (utilDate.getFullYear() === selectedYear) {
        const monthIndex = utilDate.getMonth();
        const percentage = Number(util.percentage) || 0;
        
        monthlyData[monthIndex].totalUtilization += percentage;
        monthlyData[monthIndex].entries++;
        
        if (util.Worktype?.worktype === 'chargeable') {
          monthlyData[monthIndex].chargeableUtilization += percentage;
          monthlyData[monthIndex].chargeableEntries++;
        }
      }
    });

    return monthlyData.map(data => ({
      ...data,
      avgUtilization: data.entries > 0 ? Math.round(data.totalUtilization / data.entries) : 0,
      avgChargeable: data.chargeableEntries > 0 ? Math.round(data.chargeableUtilization / data.chargeableEntries) : 0
    }));
  };

  // Calculate department and location distributions
  const calculateDistributions = () => {
    const departments = {};
    const locations = {};
    const expertiseAreas = {};

    employees.forEach(emp => {
      // Department distribution
      const dept = emp.department || 'Unspecified';
      departments[dept] = (departments[dept] || 0) + 1;

      // Location distribution
      const loc = emp.location || 'Unspecified';
      locations[loc] = (locations[loc] || 0) + 1;

      // Expertise distribution
      const exp = emp.expertise || 'Unspecified';
      expertiseAreas[exp] = (expertiseAreas[exp] || 0) + 1;
    });

    return {
      departments: Object.entries(departments).map(([name, value]) => ({ name, value })),
      locations: Object.entries(locations).map(([name, value]) => ({ name, value })),
      expertise: Object.entries(expertiseAreas).map(([name, value]) => ({ name, value }))
    };
  };

  const { stats, employeeStats } = calculateOverallStats();
  const monthlyTrends = calculateMonthlyTrends();
  const distributions = calculateDistributions();

  // Work type distribution for pie chart
  const workTypeData = [
    { name: 'Chargeable', value: stats.chargeableEntries, color: '#10B981' },
    { name: 'Non-Chargeable', value: stats.nonChargeableEntries, color: '#F59E0B' },
    { name: 'Leave', value: stats.leaveEntries, color: '#EF4444' },
    { name: 'Training', value: stats.trainingEntries, color: '#8B5CF6' }
  ];

  // Utilization statistics data
  const utilizationStats = () => {
    const utilizationRanges = [
      { range: '0-20%', count: 0, color: '#EF4444' },
      { range: '21-40%', count: 0, color: '#F59E0B' },
      { range: '41-60%', count: 0, color: '#10B981' },
      { range: '61-80%', count: 0, color: '#3B82F6' },
      { range: '81-100%', count: 0, color: '#8B5CF6' }
    ];

    employeeStats.forEach(emp => {
      const util = Math.round(emp.avgUtilization);
      if (util <= 20) utilizationRanges[0].count++;
      else if (util <= 40) utilizationRanges[1].count++;
      else if (util <= 60) utilizationRanges[2].count++;
      else if (util <= 80) utilizationRanges[3].count++;
      else utilizationRanges[4].count++;
    });

    return utilizationRanges.filter(range => range.count > 0);
  };

  const utilizationDistribution = utilizationStats();

  if (loading) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Generating Utilization Report...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing employee data and utilization patterns</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
            <svg className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-red-800 mb-3">Error Loading Report</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
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
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <SidebarToggle onToggle={toggleSidebar} />
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/50">
                <span className="text-2xl text-white font-semibold">📊</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  Utilization Analytics Report
                </h1>
                <p className="text-lg text-gray-600">Comprehensive team performance insights and analytics</p>
                <p className="text-sm text-gray-500">Generated on {reportDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-8 py-8 space-y-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Resources</h3>
                <div className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</div>
                <p className="text-xs text-gray-600 mt-2">
                  {stats.employeesOnLeave} currently on leave
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Utilization</h3>
                <div className="text-3xl font-bold text-emerald-600">{Math.round(stats.averageUtilization)}%</div>
                <p className="text-xs text-gray-600 mt-2">
                  Trend: <span className={`font-medium ${
                    stats.utilizationTrend === 'improving' ? 'text-green-600' : 
                    stats.utilizationTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stats.utilizationTrend === 'improving' ? '↗ Improving' : 
                     stats.utilizationTrend === 'declining' ? '↘ Declining' : '→ Stable'}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Billable Utilization</h3>
                <div className="text-3xl font-bold text-blue-600">{Math.round(stats.averageBillableUtilization)}%</div>
                <p className="text-xs text-gray-600 mt-2">
                  {stats.chargeableEntries} chargeable entries
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Active Projects</h3>
                <div className="text-3xl font-bold text-purple-600">{stats.totalProjects}</div>
                <p className="text-xs text-gray-600 mt-2">
                  Top performer: {stats.topPerformer || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Performance Indicators */}
        {teamFinancialData && teamFinancialData.teamSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
                  <div className="text-3xl font-bold text-green-600">
                    ${parseFloat(teamFinancialData.teamSummary.totalRevenue).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    From {teamFinancialData.teamSummary.totalEmployees} employees
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💵</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Cost</h3>
                  <div className="text-3xl font-bold text-red-600">
                    ${parseFloat(teamFinancialData.teamSummary.totalCost).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Resource costs
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💸</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Profit</h3>
                  <div className="text-3xl font-bold text-emerald-600">
                    ${parseFloat(teamFinancialData.teamSummary.totalProfit).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Net profit generated
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Profit Margin</h3>
                  <div className="text-3xl font-bold text-indigo-600">
                    {teamFinancialData.teamSummary.profitMargin}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Overall profitability
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Utilization Trend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Monthly Utilization Trends ({selectedYear})</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgUtilization" 
                    stroke="#3B82F6" 
                    fill="#93C5FD" 
                    name="Overall Utilization %"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgChargeable" 
                    stroke="#10B981" 
                    fill="#86EFAC" 
                    name="Chargeable Utilization %"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Work Type Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Work Type Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {workTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Department Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.departments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" name="Employees" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Utilization Distribution Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Utilization Distribution</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {utilizationDistribution.map((range, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: range.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{range.range}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: range.color }}>
                        {range.count}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({Math.round((range.count / employeeStats.length) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 font-medium">Average Utilization</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {Math.round(stats.averageUtilization)}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 font-medium">Billable Average</div>
                    <div className="text-2xl font-bold text-green-700">
                      {Math.round(stats.averageBillableUtilization)}%
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 font-medium">Highest Utilization</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {Math.round(stats.highestUtilization)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 font-medium">Total Entries</div>
                    <div className="text-2xl font-bold text-gray-700">
                      {stats.totalUtilizationEntries}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Analytics Charts */}
        {teamFinancialData && teamFinancialData.teamSummary && teamFinancialData.employeeBreakdown && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue vs Cost Comparison */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Revenue vs Cost Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {
                      name: 'Team Financial Overview',
                      revenue: parseFloat(teamFinancialData.teamSummary.totalRevenue),
                      cost: parseFloat(teamFinancialData.teamSummary.totalCost),
                      profit: parseFloat(teamFinancialData.teamSummary.totalProfit)
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" fill="#EF4444" name="Cost" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#3B82F6" name="Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Profit Margin Comparison */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Employee Profitability</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamFinancialData.employeeBreakdown.map(emp => ({
                    name: emp.employee.name.split(' ')[0], // First name only for space
                    profit: parseFloat(emp.totalProfit),
                    margin: parseFloat(emp.profitMargin.replace('%', ''))
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        name === 'profit' ? `$${value.toLocaleString()}` : `${value}%`, 
                        name === 'profit' ? 'Profit' : 'Margin'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="profit" fill="#8B5CF6" name="Profit ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Executive Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Utilization Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="font-medium">{stats.totalUtilizationEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest Utilization:</span>
                  <span className="font-medium text-green-600">{Math.round(stats.highestUtilization)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lowest Utilization:</span>
                  <span className="font-medium text-red-600">{Math.round(stats.lowestUtilization)}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Work Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chargeable Work:</span>
                  <span className="font-medium text-green-600">{stats.chargeableEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Non-Chargeable:</span>
                  <span className="font-medium text-yellow-600">{stats.nonChargeableEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Training:</span>
                  <span className="font-medium text-blue-600">{stats.trainingEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leave:</span>
                  <span className="font-medium text-red-600">{stats.leaveEntries}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Team Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Departments:</span>
                  <span className="font-medium">{distributions.departments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Locations:</span>
                  <span className="font-medium">{distributions.locations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expertise Areas:</span>
                  <span className="font-medium">{distributions.expertise.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currently on Leave:</span>
                  <span className="font-medium text-orange-600">{stats.employeesOnLeave}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Employee Breakdown Table */}
        {teamFinancialData && teamFinancialData.teamSummary && teamFinancialData.employeeBreakdown && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Financial Performance by Employee</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">Date Range:</label>
                  <input
                    type="date"
                    value={selectedDateRange.startDate}
                    onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={selectedDateRange.endDate}
                    onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Position</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Working Days</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Profit</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Profit Margin</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamFinancialData.employeeBreakdown.map((employee, index) => (
                    <tr key={employee.employee.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {employee.employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{employee.employee.name}</div>
                            <div className="text-sm text-gray-500">ID: {employee.employee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{employee.employee.position}</td>
                      <td className="py-4 px-4 text-gray-700">{employee.employee.department}</td>
                      <td className="py-4 px-4 text-right font-medium">{employee.workingDays}</td>
                      <td className="py-4 px-4 text-right font-medium text-red-600">
                        ${parseFloat(employee.totalCost).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-green-600">
                        ${parseFloat(employee.totalRevenue).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-blue-600">
                        ${parseFloat(employee.totalProfit).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          parseFloat(employee.profitMargin.replace('%', '')) >= 50 
                            ? 'bg-green-100 text-green-800' 
                            : parseFloat(employee.profitMargin.replace('%', '')) >= 30 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.profitMargin}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.isChargeable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.isChargeable ? 'Chargeable' : 'Non-Chargeable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan="3" className="py-4 px-4 font-semibold text-gray-800">Team Total</td>
                    <td className="py-4 px-4 text-right font-bold">
                      {teamFinancialData.employeeBreakdown.reduce((sum, emp) => sum + emp.workingDays, 0)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-red-600">
                      ${parseFloat(teamFinancialData.teamSummary.totalCost).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">
                      ${parseFloat(teamFinancialData.teamSummary.totalRevenue).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-blue-600">
                      ${parseFloat(teamFinancialData.teamSummary.totalProfit).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {teamFinancialData.teamSummary.profitMargin}
                      </span>
                    </td>
                    <td className="py-4 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Individual Employee Details */}
            <div className="mt-8 space-y-6">
              <h4 className="text-lg font-semibold text-gray-800">Individual Employee Financial Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(employeeFinancialData)
                  .filter(([employeeId, data]) => data && data.employee && data.summary && data.period && data.costRates)
                  .map(([employeeId, data]) => (
                  <div key={employeeId} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {data.employee.name ? data.employee.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">{data.employee.name || 'Unknown'}</h5>
                        <p className="text-sm text-gray-600">{data.employee.position || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Period:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {data.period.startDate ? new Date(data.period.startDate).toLocaleDateString() : 'N/A'} - {data.period.endDate ? new Date(data.period.endDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Working Days:</span>
                        <span className="text-sm font-medium text-gray-800">{data.summary.totalWorkingDays || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Daily Rate:</span>
                        <span className="text-sm font-medium text-green-600">${data.costRates.dailyClientRate || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Daily Cost:</span>
                        <span className="text-sm font-medium text-red-600">${data.costRates.dailyResourceCost || 0}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Net Profit:</span>
                          <span className="text-lg font-bold text-blue-600">
                            ${data.summary.totalProfit ? parseFloat(data.summary.totalProfit).toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(employeeFinancialData).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No detailed financial data available</p>
                      <p className="text-sm text-gray-400 mt-1">Individual employee financial details will appear here when data is loaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UtilizationReport; 