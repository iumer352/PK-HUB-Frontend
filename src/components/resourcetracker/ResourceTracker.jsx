import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const workTypes = {
  chargeable: { label: 'Project Work (Chargeable)', color: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-green-100 to-emerald-200 border-l-4 border-green-500' },
  nonChargeable: { label: 'Non-chargeable Work', color: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-orange-100 to-amber-200 border-l-4 border-orange-500' },
  leave: { label: 'Leave', color: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-slate-200 to-gray-300 border-l-4 border-slate-400' }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const worktypeIdMap = {
  'chargeable': 1,
  'non-chargeable': 2,
  'annual leave': 3,
  'training': 4
};

// Helper function to format date in YYYY-MM-DD without timezone issues
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Get week of month (weeks start on Sunday)
function getWeekOfMonth(date) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const offsetDate = d.getDate() + dayOfWeek - 1;
  const weekNumber = Math.ceil(offsetDate / 7);
  return weekNumber;
}

// Helper: Generate weeks for a month and surrounding weeks
const generateWeeksAroundMonth = (month, year) => {
  const monthIndex = months.indexOf(month);
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const weeks = [];

  let currentDate = new Date(firstDayOfMonth);
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  const endDateLimit = new Date(lastDayOfMonth);
  endDateLimit.setDate(lastDayOfMonth.getDate() + 7 * 2);

  while (currentDate <= endDateLimit) {
    const weekLabel = `${currentDate.getDate()} ${months[currentDate.getMonth()].substring(0, 3)}`;
    weeks.push({
      label: weekLabel,
      year: currentDate.getFullYear(),
      month: months[currentDate.getMonth()],
      weekStartDate: new Date(currentDate)
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

// Helper to map backend worktype to frontend key
function getWorkTypeKey(worktype) {
  if (!worktype) return 'chargeable';
  if (worktype === 'chargeable') return 'chargeable';
  if (worktype === 'non-chargeable') return 'nonChargeable';
  if (worktype === 'annual leave') return 'leave';
  if (worktype === 'training') return 'training';
  return 'chargeable';
}

const ResourceTracker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date();
  const [employee, setEmployee] = useState(null);
  const [selectedMonth1, setSelectedMonth1] = useState(months[currentDate.getMonth()]);
  const [selectedMonth2, setSelectedMonth2] = useState(months[(currentDate.getMonth() + 1) % 12]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [weeks, setWeeks] = useState([]);
  const [utilizations, setUtilizations] = useState([]);
  const [employeeChanges, setEmployeeChanges] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCellId, setEditingCellId] = useState(null);
  const [editingPercentage, setEditingPercentage] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to show toast notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch employee data
  useEffect(() => {
    async function fetchEmployee() {
      try {
        const response = await axios.get(`http://localhost:5001/api/employees/${id}`);
        setEmployee(response.data);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        showToast('Failed to fetch employee data', 'error');
        navigate('/employee-dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEmployee();
    }
  }, [id, navigate]);

  // Fetch utilizations for the employee
  useEffect(() => {
    async function fetchUtilizations() {
      if (!employee?.id) return;

      try {
        const response = await axios.get(`http://localhost:5001/api/utilization/employee/${employee.id}`);
        const sortedUtils = response.data.sort((a, b) => {
          const dateA = new Date(a.Timesheet?.date || a.createdAt);
          const dateB = new Date(b.Timesheet?.date || b.createdAt);
          return dateB - dateA;
        });

        setUtilizations(sortedUtils);
      } catch (error) {
        console.error('Failed to fetch utilizations:', error);
        showToast('Failed to fetch utilization data', 'error');
      }
    }

    fetchUtilizations();
  }, [employee?.id]);

  // Generate weeks when months or year changes
  useEffect(() => {
    const startMonthIndex = months.indexOf(selectedMonth1);
    const endMonthIndex = months.indexOf(selectedMonth2);

    // Determine if we're crossing year boundary (e.g., Dec to Jan)
    const crossesYearBoundary = startMonthIndex > endMonthIndex;

    // Generate weeks for ALL months in the range
    const allWeeks = [];

    if (crossesYearBoundary) {
      // Handle year boundary crossing (e.g., Dec to Jan)
      // First, add months from startMonth to December
      for (let i = startMonthIndex; i < 12; i++) {
        const monthWeeks = generateWeeksAroundMonth(months[i], selectedYear);
        allWeeks.push(...monthWeeks);
      }
      // Then, add months from January to endMonth in next year
      for (let i = 0; i <= endMonthIndex; i++) {
        const monthWeeks = generateWeeksAroundMonth(months[i], selectedYear + 1);
        allWeeks.push(...monthWeeks);
      }
    } else {
      // Normal range - generate weeks for all months from start to end
      for (let i = startMonthIndex; i <= endMonthIndex; i++) {
        const monthWeeks = generateWeeksAroundMonth(months[i], selectedYear);
        allWeeks.push(...monthWeeks);
      }
    }

    // Remove duplicate weeks based on week start date
    const uniqueWeeksMap = new Map();
    allWeeks.forEach(week => {
      const weekKey = week.weekStartDate.toISOString().split('T')[0];
      uniqueWeeksMap.set(weekKey, week);
    });

    const generatedWeeks = Array.from(uniqueWeeksMap.values());

    // Filter weeks to include only those that START within the selected month range
    const relevantWeeks = generatedWeeks.filter(week => {
      const weekStartDate = new Date(week.weekStartDate);
      const startMonth = weekStartDate.getMonth(); // 0-indexed
      const startYear = weekStartDate.getFullYear();

      // Check if the week start date falls within the selected month range
      if (startYear === selectedYear) {
        if (startMonthIndex <= endMonthIndex) {
          // Normal range (e.g., May to June)
          return startMonth >= startMonthIndex && startMonth <= endMonthIndex;
        } else {
          // Wraps around year (e.g., Dec to Jan) - include Dec onwards
          return startMonth >= startMonthIndex;
        }
      } else if (crossesYearBoundary && startYear === selectedYear + 1) {
        // Handle year wrap for the next year part - include Jan up to end month
        return startMonth <= endMonthIndex;
      }

      return false;
    });

    // Sort weeks chronologically
    relevantWeeks.sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());

    setWeeks(relevantWeeks);
  }, [selectedMonth1, selectedMonth2, selectedYear]);

  // Helper to find utilization for a specific week
  const findUtilization = (week) => {
    const weekStartDate = formatDateToYYYYMMDD(week.weekStartDate);
    const matchingUtils = utilizations.filter(util => {
      const utilDate = util.Timesheet?.date;
      return utilDate === weekStartDate;
    });

    if (matchingUtils.length > 0) {
      return matchingUtils.reduce((latest, current) => {
        const latestDate = new Date(latest.updatedAt || latest.createdAt);
        const currentDate = new Date(current.updatedAt || current.createdAt);
        return currentDate > latestDate ? current : latest;
      });
    }

    return null;
  };

  // Handle percentage input change
  const handlePercentageChange = (week, value) => {
    const cellId = `${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;

    setEditingCellId(cellId);
    setEditingPercentage(value);

    const currentUtil = findUtilization(week);
    const newValue = Number(value) || 0;

    setUnsavedChanges(prev => ({
      ...prev,
      [cellId]: {
        week,
        percentage: newValue,
        worktypeId: prev[cellId]?.worktypeId || currentUtil?.worktypeId || 1,
        worktype: prev[cellId]?.worktype || currentUtil?.Worktype?.worktype || 'chargeable',
        projectname: prev[cellId]?.projectname || currentUtil?.projectname || 'Resource Tracker',
        expected_finish_date: prev[cellId]?.expected_finish_date || currentUtil?.expected_finish_date || new Date().toISOString().split('T')[0]
      }
    }));
  };

  // Handle work type change
  const handleWorkTypeChange = async (worktypeKey) => {
    if (!selectedCell) return;

    const { weekData } = selectedCell;
    const cellId = `${weekData.year}-${weekData.month}-${getWeekOfMonth(weekData.weekStartDate)}`;
    const currentUtil = findUtilization(weekData);

    const worktypeId = worktypeIdMap[worktypeKey === 'nonChargeable' ? 'non-chargeable' :
      worktypeKey === 'leave' ? 'annual leave' : worktypeKey];

    if (!worktypeId) {
      console.error('Invalid worktype key:', worktypeKey);
      showToast('Invalid work type selected', 'error');
      return;
    }

    setUnsavedChanges(prev => ({
      ...prev,
      [cellId]: {
        week: weekData,
        percentage: prev[cellId]?.percentage || currentUtil?.percentage || 0,
        worktypeId: worktypeId,
        worktype: worktypeKey === 'nonChargeable' ? 'non-chargeable' :
          worktypeKey === 'leave' ? 'annual leave' : worktypeKey,
        projectname: prev[cellId]?.projectname || currentUtil?.projectname || 'Resource Tracker',
        expected_finish_date: prev[cellId]?.expected_finish_date || currentUtil?.expected_finish_date || new Date().toISOString().split('T')[0]
      }
    }));

    showToast('Work type selected - enter percentage and save changes', 'info');

    setTimeout(() => {
      setEditingCellId(cellId);
      setEditingPercentage(String(unsavedChanges[cellId]?.percentage || currentUtil?.percentage || '0'));
      const inputElement = document.querySelector(`td[data-cell-id="${cellId}"] input`);
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 100);
  };

  // Handler for deleting a utilization
  const handleDeleteUtilization = async (week) => {
    // Find the utilization to delete
    const util = findUtilization(week);

    if (!util || !util.id) {
      showToast('No saved utilization found to delete', 'error');
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this utilization entry?')) {
      return;
    }

    try {
      // Call the DELETE API
      await axios.delete(`http://localhost:5001/api/utilization/${util.id}`);

      // Remove from local state
      setUtilizations(prev => prev.filter(u => u.id !== util.id));

      // Clear all selection and editing states
      setSelectedCell(null);
      setEditingCellId(null);
      setEditingPercentage('');

      // Clear any unsaved changes for this cell
      const cellId = `${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
      setUnsavedChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[cellId];
        return newChanges;
      });

      showToast('Utilization deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting utilization:', error);
      showToast('Failed to delete utilization', 'error');
    }
  };

  // Handle employee field changes
  const handleEmployeeFieldChange = (fieldName, value) => {
    setEmployeeChanges(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Save employee changes
  const saveEmployeeChanges = async () => {
    if (!employee?.id || Object.keys(employeeChanges).length === 0) {
      showToast('No changes to save', 'info');
      return;
    }

    try {
      const backendChanges = {
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        expertise: employee.expertise,
        leaves_expected: employeeChanges.expectedLeave || employee.leaves_expected || '0',
        ksa_status: employeeChanges.ableToWorkInKSA ? 'Yes' : 'No' || employee.ksa_status || 'No'
      };

      const response = await axios.put(`http://localhost:5001/api/employees/${employee.id}`, backendChanges);

      if (response.data) {
        Object.assign(employee, response.data);
        setEmployeeChanges({});
        showToast('Employee details updated successfully', 'success');

        if (employeeChanges.chargeableProjects || employeeChanges.duration) {
          const latestUtil = utilizations[0];
          if (latestUtil) {
            const updateData = {
              employeeId: employee.id,
              date: latestUtil.Timesheet.date,
              worktypeId: latestUtil.worktypeId,
              percentage: latestUtil.percentage,
              projectname: employeeChanges.chargeableProjects || latestUtil.projectname,
              expected_finish_date: employeeChanges.duration || latestUtil.expected_finish_date || ' '
            };

            try {
              const utilResponse = await axios.put(
                `http://localhost:5001/api/utilization/${latestUtil.id}`,
                updateData
              );

              if (utilResponse.data) {
                setUtilizations(prev => {
                  const updated = [...prev];
                  const index = updated.findIndex(u => u.id === latestUtil.id);
                  if (index > -1) {
                    updated[index] = {
                      ...utilResponse.data,
                      Timesheet: latestUtil.Timesheet,
                      Worktype: latestUtil.Worktype
                    };
                  }
                  return updated;
                });
                showToast('Utilization updated successfully', 'success');
              }
            } catch (error) {
              console.error('Error updating utilization:', error);
              showToast('Failed to update utilization', 'error');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      showToast('Failed to update employee details', 'error');
    }
  };

  // Helper functions to get latest data
  const getLatestProjectName = () => {
    if (utilizations.length === 0) return '';
    const sortedUtils = [...utilizations].sort((a, b) => {
      const dateA = new Date(a.Timesheet?.date || a.createdAt);
      const dateB = new Date(b.Timesheet?.date || b.createdAt);
      return dateB - dateA;
    });
    const latestUtil = sortedUtils.find(util =>
      util.projectname &&
      util.projectname !== 'Resource Tracker' &&
      util.projectname.toLowerCase() !== 'non project assigned' &&
      util.projectname.toLowerCase() !== 'no project'
    );
    return latestUtil?.projectname || '';
  };

  const getLatestDuration = () => {
    if (utilizations.length === 0) return '';
    const sortedUtils = [...utilizations].sort((a, b) => {
      const dateA = new Date(a.Timesheet?.date || a.createdAt);
      const dateB = new Date(b.Timesheet?.date || b.createdAt);
      return dateB - dateA;
    });
    const latestUtil = sortedUtils.find(util =>
      util.expected_finish_date &&
      util.expected_finish_date !== ' ' &&
      util.expected_finish_date.toLowerCase() !== 'tbd'
    );
    return latestUtil?.expected_finish_date || '';
  };

  // Save all utilization changes
  const saveAllChanges = async () => {
    const changeEntries = Object.entries(unsavedChanges);
    if (changeEntries.length === 0) {
      showToast('No changes to save', 'info');
      return;
    }

    let savedCount = 0;
    let errorCount = 0;

    for (const [cellId, change] of changeEntries) {
      try {
        if (change.percentage < 0 || change.percentage > 100) {
          showToast(`Invalid percentage ${change.percentage}% for cell ${cellId}`, 'error');
          errorCount++;
          continue;
        }

        const existingUtil = findUtilization(change.week);
        const isUpdate = !!existingUtil;

        const chargeableProjects = employeeChanges.chargeableProjects !== undefined
          ? employeeChanges.chargeableProjects
          : getLatestProjectName();
        const duration = employeeChanges.duration !== undefined
          ? employeeChanges.duration
          : getLatestDuration();

        const updateData = {
          employeeId: employee.id,
          date: formatDateToYYYYMMDD(change.week.weekStartDate),
          worktypeId: change.worktypeId,
          percentage: change.percentage,
          projectname: chargeableProjects || 'Resource Tracker',
          expected_finish_date: duration || ' '
        };

        const response = await axios[isUpdate ? 'put' : 'post'](
          `http://localhost:5001/api/utilization${isUpdate ? `/${existingUtil.id}` : ''}`,
          updateData
        );

        if (response.data) {
          const formattedResponse = {
            ...response.data,
            Timesheet: {
              date: updateData.date,
              year: change.week.year,
              month: change.week.month,
              day: new Date(updateData.date).getDate()
            },
            Worktype: {
              worktype: response.data.worktypeId === 1 ? 'chargeable' :
                response.data.worktypeId === 2 ? 'non-chargeable' :
                  response.data.worktypeId === 3 ? 'annual leave' : 'training'
            }
          };

          setUtilizations(prev => {
            const updated = [...prev];
            const index = updated.findIndex(u => u.Timesheet?.date === updateData.date);
            if (index > -1) {
              updated[index] = formattedResponse;
            } else {
              updated.push(formattedResponse);
            }
            return updated;
          });

          savedCount++;
        }
      } catch (error) {
        console.error(`Error saving change for cell ${cellId}:`, error);
        errorCount++;
      }
    }

    if (savedCount > 0) {
      setUnsavedChanges({});

      // Clear selection states to hide delete section
      setSelectedCell(null);
      setEditingCellId(null);
      setEditingPercentage('');

      showToast(`${savedCount} utilization records updated successfully!`, 'success');
    }

    if (errorCount > 0) {
      showToast(`${errorCount} updates failed`, 'error');
    }
  };

  // Handle cell click for selection
  const handleCellClick = (week, e) => {
    if (e.target.tagName === 'INPUT') return;

    const cellId = `${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
    const util = findUtilization(week) || {};
    const hasData = util.percentage > 0 || util.Worktype?.worktype;

    setSelectedCell({ weekLabel: week.label, weekData: week });

    if (hasData) {
      setTimeout(() => {
        setEditingCellId(cellId);
        setEditingPercentage(String(util.percentage || ''));
        const inputElement = document.querySelector(`td[data-cell-id="${cellId}"] input`);
        if (inputElement) {
          inputElement.focus();
          inputElement.select();
        }
      }, 50);
    }
  };

  // Helper function to parse leave date and check if current date falls within 7-day leave period
  const isEmployeeCurrentlyOnLeave = (employee) => {
    // Get the employee's leave date
    const leaveDates = employeeChanges.expectedLeave ?? employee?.leaves_expected;
    if (!leaveDates || leaveDates === '0' || leaveDates.trim() === '') return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    try {
      // Handle different date formats like "8 June", "June 8", "8 Jun", etc.
      const dateStr = leaveDates.toLowerCase().trim();

      // Extract month names (both full and abbreviated)
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const fullMonthNames = ['january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'];

      let month = -1;
      let leaveDay = null;

      // Find the month in the string (check both full and abbreviated names)
      for (let i = 0; i < monthNames.length; i++) {
        if (dateStr.includes(monthNames[i]) || dateStr.includes(fullMonthNames[i])) {
          month = i;
          break;
        }
      }

      if (month === -1) return false; // No valid month found

      // Extract day number using regex
      const dayMatches = dateStr.match(/\d+/g);
      if (dayMatches && dayMatches.length >= 1) {
        leaveDay = parseInt(dayMatches[0]);
      } else {
        return false; // No valid day found
      }

      // Create leave start date
      const leaveStartDate = new Date(currentYear, month, leaveDay);

      // Add 7 days to get leave end date
      const leaveEndDate = new Date(leaveStartDate);
      leaveEndDate.setDate(leaveStartDate.getDate() + 7);

      // If leave period has passed this year, check next year
      if (leaveEndDate < currentDate) {
        leaveStartDate.setFullYear(currentYear + 1);
        leaveEndDate.setFullYear(currentYear + 1);
      }

      // Check if current date falls within the 7-day leave period
      return currentDate >= leaveStartDate && currentDate <= leaveEndDate;

    } catch (error) {
      console.log('Error parsing leave date:', leaveDates, error);
      return false;
    }
  };

  const calculateStats = () => {
    const stats = {
      averageUtilization: 0,
      averageBillableUtilization: 0,
      chargeableWork: 0,
      nonChargeableWork: 0,
      onLeave: isEmployeeCurrentlyOnLeave(employee) ? 1 : 0,
      inTraining: 0
    };

    let totalUtilization = 0;
    let totalEntries = 0;
    let chargeablePercentageSum = 0; // Sum of chargeable percentages
    let totalWeeksWithData = 0;

    weeks.forEach(week => {
      const weekStartDate = formatDateToYYYYMMDD(week.weekStartDate);
      const weekUtil = utilizations.find(util =>
        util.Timesheet?.date === weekStartDate
      );

      if (weekUtil) {
        totalWeeksWithData++;
        const percentage = Number(weekUtil.percentage) || 0;
        totalUtilization += percentage;
        totalEntries++;

        const workTypeKey = getWorkTypeKey(weekUtil.Worktype?.worktype);
        if (workTypeKey === 'chargeable' || workTypeKey === 'leave') {
          // Add the actual percentage of chargeability (e.g., 50% = 0.5)
          chargeablePercentageSum += percentage / 100;
          stats.chargeableWork++;
        } else {
          switch (workTypeKey) {
            case 'nonChargeable':
              stats.nonChargeableWork++;
              break;
            case 'training':
              stats.inTraining++;
              break;
          }
        }
      }
    });

    // Calculate average billable utilization (average chargeable percentage across ALL weeks in the period)
    stats.averageBillableUtilization = weeks.length > 0 ?
      ((chargeablePercentageSum / weeks.length) * 100).toFixed(1) : 0;

    // Calculate overall average utilization (weighted across ALL weeks in the period)
    stats.averageUtilization = weeks.length > 0 ? (totalUtilization / weeks.length).toFixed(1) : 0;

    return stats;
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Employee Not Found</h3>
            <p className="text-red-600 mb-4">The employee you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/employee-dashboard')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* CSS to hide number input arrows */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide number input arrows in Chrome, Safari, Edge */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          /* Hide number input arrows in Firefox */
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `
      }} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <SidebarToggle onToggle={toggleSidebar} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">{employee.name} - Resource Tracker</h1>
              <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
            </div>
          </div>

          {/* Month and Year Selection */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={selectedMonth1}
                onChange={(e) => setSelectedMonth1(e.target.value)}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <span className="text-gray-500 font-medium">to</span>
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={selectedMonth2}
                onChange={(e) => setSelectedMonth2(e.target.value)}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <select
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-lg mb-4 shadow-xl">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-sm opacity-90 font-medium">Average Billable Utilization - Per Selected Month</div>
              <div className="text-3xl font-bold mt-2">{stats.averageBillableUtilization}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-sm opacity-90 font-medium">Average Utilization - Per Selected Month</div>
              <div className="text-3xl font-bold mt-2">{stats.averageUtilization}%</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-sm flex-wrap">
          {Object.entries(workTypes).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${color} rounded border border-gray-300`}></div>
              <span className="font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Selected Entry Section - appears when a cell with saved data is selected */}
      {selectedCell && (() => {
        const util = findUtilization(selectedCell.weekData);

        // Only show if there's saved data (not just unsaved changes)
        return util && util.id ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-red-400 to-pink-400 rounded-full shadow-lg"></div>
                <span className="text-red-800 font-semibold">
                  Selected week has saved utilization data
                </span>
              </div>
              <button
                onClick={() => handleDeleteUtilization(selectedCell.weekData)}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
              >
                Delete Selected Entry
              </button>
            </div>
          </div>
        ) : null;
      })()}

      {/* Save Changes Section */}
      {(Object.keys(unsavedChanges).length > 0 || Object.keys(employeeChanges).length > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-amber-800 font-semibold">
                You have {Object.keys(unsavedChanges).length} utilization change(s) and {Object.keys(employeeChanges).length} employee change(s)
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUnsavedChanges({});
                  setEmployeeChanges({});
                  setEditingCellId(null);
                  setEditingPercentage('');
                  setSelectedCell(null);
                }}
                className="px-6 py-2 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
              >
                Discard All Changes
              </button>
              {Object.keys(employeeChanges).length > 0 && (
                <button
                  onClick={saveEmployeeChanges}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Save Employee Changes
                </button>
              )}
              {Object.keys(unsavedChanges).length > 0 && (
                <button
                  onClick={saveAllChanges}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Save Utilization Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-100 border-b border-indigo-200">
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left sticky left-0 bg-gradient-to-r from-slate-100 to-blue-100 z-20 min-w-[120px]">Name</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left sticky left-[120px] bg-gradient-to-r from-blue-100 to-indigo-100 z-20 min-w-[100px]">Position</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[80px]">Location</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[140px]">KSA Solution</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[140px]">Area of Expertise</th>
                {weeks.map(week => (
                  <th key={week.label} className="border border-indigo-200 p-2 text-xs text-gray-700 font-bold text-center min-w-[80px] bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-indigo-700">{week.label}</div>
                  </th>
                ))}
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[200px]">Projects</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-center min-w-[120px]">Leaves Expected</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-center min-w-[100px]">Able to work in KSA</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-center min-w-[100px]">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white hover:bg-blue-50 transition-colors">
                <td className="border border-gray-200 p-3 text-sm sticky left-0 bg-inherit font-medium z-10">
                  {employee.name}
                </td>
                <td className="border border-gray-200 p-3 text-sm sticky left-[120px] bg-inherit z-10">
                  {employee.position}
                </td>
                <td className="border border-gray-200 p-3 text-sm">{employee.location || 'Lahore'}</td>
                <td className="border border-gray-200 p-3 text-sm">{employee.ksaSolution || 'Data Transformation'}</td>
                <td className="border border-gray-200 p-3 text-sm">{employee.expertise || 'Analytics & AI'}</td>
                {weeks.map(week => {
                  const util = findUtilization(week) || {};
                  const cellId = `${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
                  const isSelected = selectedCell?.weekLabel === week.label;
                  const isEditing = editingCellId === cellId;
                  const hasUnsavedChanges = unsavedChanges[cellId];

                  const displayData = hasUnsavedChanges ? {
                    percentage: hasUnsavedChanges.percentage,
                    worktype: hasUnsavedChanges.worktype
                  } : {
                    percentage: util.percentage,
                    worktype: util.Worktype?.worktype
                  };

                  const workType = getWorkTypeKey(displayData.worktype);
                  const hasData = displayData.percentage > 0 || displayData.worktype;
                  const cellBgColor = hasData ? workTypes[workType]?.bgColor || 'bg-white' : 'bg-white';

                  return (
                    <td
                      key={week.label}
                      data-cell-id={cellId}
                      className={`border border-gray-200 p-1 relative group transition-all duration-200 cursor-pointer text-center shadow-sm
                        ${cellBgColor} 
                        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : ''} 
                        ${isEditing ? 'ring-2 ring-orange-500' : ''}
                        ${hasUnsavedChanges ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}
                        hover:shadow-md
                      `}
                      onClick={(e) => handleCellClick(week, e)}
                      tabIndex={0}
                    >
                      {(isEditing || (isSelected && !hasData)) ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingCellId === cellId ? editingPercentage : (displayData.percentage || '')}
                          onChange={(e) => handlePercentageChange(week, e.target.value)}
                          onFocus={(e) => {
                            setEditingCellId(cellId);
                            setEditingPercentage(String(displayData.percentage || ''));
                            e.target.select();
                          }}
                          className={`w-full bg-transparent text-center focus:outline-none text-sm font-bold cursor-text ${hasUnsavedChanges ? 'text-orange-600' : ''
                            }`}
                          placeholder="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : hasData ? (
                        <div className="w-full text-center py-2">
                          <span className={`text-sm font-bold ${hasUnsavedChanges ? 'text-orange-600' : 'text-gray-800'}`}>
                            {displayData.percentage}%
                          </span>
                        </div>
                      ) : (
                        <div className={`w-full text-center text-sm py-2 ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-400'
                          }`}>
                          {isSelected ? 'Select type ↓' : '0%'}
                        </div>
                      )}

                      {hasUnsavedChanges && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                      )}
                    </td>
                  );
                })}
                <td className="border border-gray-200 p-3 text-sm">
                  <input
                    type="text"
                    value={employeeChanges.chargeableProjects ?? getLatestProjectName()}
                    onChange={(e) => handleEmployeeFieldChange('chargeableProjects', e.target.value)}
                    className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 ${employeeChanges.chargeableProjects !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                    placeholder="Enter project/comments"
                  />
                </td>
                <td className="border border-gray-200 p-3 text-sm text-center">
                  <input
                    type="text"
                    value={employeeChanges.expectedLeave ?? employee.leaves_expected ?? ''}
                    onChange={(e) => handleEmployeeFieldChange('expectedLeave', e.target.value)}
                    className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-center ${employeeChanges.expectedLeave !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                    placeholder="e.g. 15 to 20 Aug"
                  />
                </td>
                <td className="border border-gray-200 p-3 text-sm text-center">
                  <select
                    value={employeeChanges.ableToWorkInKSA !== undefined ?
                      (employeeChanges.ableToWorkInKSA ? 'Yes' : 'No') :
                      (employee.ksa_status || 'No')}
                    onChange={(e) => handleEmployeeFieldChange('ableToWorkInKSA', e.target.value === 'Yes')}
                    className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-center ${employeeChanges.ableToWorkInKSA !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td className="border border-gray-200 p-3 text-sm text-center">
                  <input
                    type="text"
                    value={employeeChanges.duration ?? getLatestDuration()}
                    onChange={(e) => handleEmployeeFieldChange('duration', e.target.value)}
                    className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-center ${employeeChanges.duration !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                    placeholder="e.g. 6 Months"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600 font-medium">
            {selectedCell ?
              `Select work type for week ${selectedCell.weekLabel}` :
              'Click on any week above to select work type'
            }
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(workTypes).map(([key, { label, color }]) => (
              <button
                key={key}
                className={`px-4 py-2 border border-gray-200 ${color} rounded-md shadow-sm transition-all duration-200 text-sm font-medium ${selectedCell ? 'hover:shadow-md cursor-pointer transform hover:scale-105' : 'opacity-50 cursor-not-allowed'
                  }`}
                onClick={() => handleWorkTypeChange(key)}
                disabled={!selectedCell}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="text-sm font-medium text-blue-800 mb-2">Instructions:</div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• <strong>Utilization:</strong> Click any week to select it, then choose a work type from the buttons below</div>
          <div>• After selecting work type, click the week again to enter percentage</div>
          <div>• <strong>Employee Fields:</strong> Click directly on any employee field (Projects, Leaves, KSA, Duration) to edit</div>
          <div>• Changes are highlighted in yellow - use separate save buttons for utilization vs employee data</div>
          <div>• Use "Discard All Changes" to revert unsaved modifications</div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500 text-black' :
          toast.type === 'error' ? 'bg-red-500 text-black' :
            'bg-blue-500 text-white'
          }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ResourceTracker; 