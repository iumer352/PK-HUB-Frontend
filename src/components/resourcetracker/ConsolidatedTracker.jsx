import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const workTypes = {
  chargeable: { label: 'Project Work (Chargeable)', color: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-green-100 to-emerald-200 border-l-4 border-green-500' },
  nonChargeable: { label: 'Non-chargeable Work', color: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-orange-100 to-amber-200 border-l-4 border-orange-500' },
  leave: { label: 'Annual Leave', color: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-slate-100 to-gray-200 border-l-4 border-slate-400' },
  training: { label: 'Chargeable+non chargeable', color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg', bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-400' }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper: Get week of month (weeks start on Sunday)
function getWeekOfMonth(date) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfWeek = firstDay.getDay(); // Sunday is 0, no adjustment needed
  const offsetDate = d.getDate() + dayOfWeek - 1;
  const weekNumber = Math.ceil(offsetDate / 7);
  
  /*console.log(`Week calculation for ${date}:`, {
    originalDate: date,
    parsedDate: d.toISOString(),
    year: d.getFullYear(),
    month: d.getMonth() + 1, // 1-indexed for display
    day: d.getDate(),
    firstDayOfMonth: firstDay.toISOString(),
    firstDayWeekday: firstDay.getDay(),
    offsetDate,
    calculatedWeekNumber: weekNumber
  });*/
  
  return weekNumber;
}

// Helper: Generate weeks for a month and surrounding weeks
const generateWeeksAroundMonth = (month, year) => {
  // Convert month name to 0-based index
  const monthIndex = months.indexOf(month);
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const weeks = [];

  let currentDate = new Date(firstDayOfMonth);
  // Find the first Sunday on or before the 1st of the month
  while (currentDate.getDay() !== 0) { // 0 represents Sunday
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Generate weeks until we pass the last day of the month
  const endDateLimit = new Date(lastDayOfMonth);
  endDateLimit.setDate(lastDayOfMonth.getDate() + 7 * 2); // Go up to two weeks past the end of the month

  while (currentDate <= endDateLimit) {
    const weekLabel = `${currentDate.getDate()} ${months[currentDate.getMonth()].substring(0, 3)}`;
    weeks.push({
      label: weekLabel,
      year: currentDate.getFullYear(),
      month: months[currentDate.getMonth()], // Store month name instead of number
      weekStartDate: new Date(currentDate) // Store a copy
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

// Helper: Fetch utilizations for an employee with better date handling
async function fetchUtilizationsForEmployee(employeeId) {
  try {
    const response = await axios.get(`/api1/utilization/employee/${employeeId}`);
    // Sort utilizations by date in descending order (newest first)
    return response.data.sort((a, b) => {
      const dateA = new Date(a.Timesheet?.date || a.createdAt);
      const dateB = new Date(b.Timesheet?.date || b.createdAt);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Failed to fetch utilization for employee', employeeId, error.response?.status, error.message);
    return [];
  }
}

// Update the postUtilization function to handle both POST and PUT
async function postUtilization(utilizationData, isUpdate = false) {
    try {
        console.log('Attempting to post/put utilization data:', {
            isUpdate,
            data: utilizationData,
            url: isUpdate ? `/api1/utilization/${utilizationData.id}` : '/api1/utilization'
        });
        
        let url;
        if (isUpdate) {
            // For updates, use the regular utilization endpoint with the utilization ID
            url = `/api1/utilization/${utilizationData.id}`;
            // Remove id from request body as it's in the URL
            delete utilizationData.id;
        } else {
            // For new records, use the regular utilization endpoint
            url = '/api1/utilization';
        }
        
        const method = isUpdate ? 'put' : 'post';
        
        const response = await axios[method](url, utilizationData, {
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('API Response:', {
            status: response.status,
            data: response.data,
            method,
            url
        });
        
        if (!response.data) {
            throw new Error('No data received from server');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error saving utilization:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            data: utilizationData,
            isUpdate,
            url: isUpdate ? `/api1/utilization/${utilizationData.id}` : '/api1/utilization'
        });
        
        // Throw the error to be handled by the caller
        throw error;
    }
}

// Add this constant at the top with other constants
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

const ConsolidatedTracker = () => {
  const currentDate = new Date();
  const [employees, setEmployees] = useState([]);
  const [selectedMonth1, setSelectedMonth1] = useState(months[currentDate.getMonth()]);
  const [selectedMonth2, setSelectedMonth2] = useState(months[(currentDate.getMonth() + 1) % 12]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [weeks, setWeeks] = useState([]);
  const [filters, setFilters] = useState({
    location: 'all',
    expertise: 'all'
  });
  const [utilizations, setUtilizations] = useState({});
  const [selectedCell, setSelectedCell] = useState(null); // { employeeId, weekLabel }
  const [copiedCell, setCopiedCell] = useState(null); // { percentage, worktypeId, projectname, expected_finish_date, leaves_expected, ksa_status }

  // Add state for tracking the currently edited percentage input
  const [editingCellId, setEditingCellId] = useState(null); // Format: `${employeeId}-${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`
  const [editingPercentage, setEditingPercentage] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState({}); // Track unsaved changes by cellId
  
  // Excel-like functionality state
  const [selectedCellId, setSelectedCellId] = useState(null); // Currently selected cell
  const [copiedCellData, setCopiedCellData] = useState(null); // Copied cell data
  const [copiedCellId, setCopiedCellId] = useState(null); // ID of copied cell for visual feedback
  
  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type }

  // Add state for detailed editing
  const [showDetailedEdit, setShowDetailedEdit] = useState(false);
  const [detailedEditData, setDetailedEditData] = useState(null);
  
  // Add state for employee field editing
  const [editingEmployeeField, setEditingEmployeeField] = useState(null); // Format: `${employeeId}-${fieldName}`
  const [employeeChanges, setEmployeeChanges] = useState({}); // Track unsaved employee changes
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to show toast notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000); // Hide after 2 seconds
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fetch employees on mount
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await axios.get('/api1/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to fetch employees', error.response?.status, error.message);
        setEmployees([]);
      }
    }
    fetchEmployees();
  }, []);

  // Fetch utilizations for all employees when employees or selected period changes
  useEffect(() => {
    async function fetchAllUtilizations() {
      const utilMap = {};

      if (employees.length === 0) return;

      console.log('Fetching utilizations for period:', { selectedMonth1, selectedMonth2, selectedYear });

      for (const emp of employees) {
        try {
          const employeeUtil = await fetchUtilizationsForEmployee(emp.id);
          
          // Filter utilization based on selected months and year range
          utilMap[emp.id] = employeeUtil.filter(util => {
            const utilDate = util.Timesheet?.date;
            if (!utilDate) return false;
            
            const utilDateObj = new Date(utilDate);
            const utilMonthName = months[utilDateObj.getMonth()]; // Get month name
            const utilYear = utilDateObj.getFullYear();

            // Ensure year matches
            if (utilYear !== selectedYear) return false;

            // Compare month names directly
            if (selectedMonth1 <= selectedMonth2) {
              // Standard range (e.g., May to June)
              return utilMonthName >= selectedMonth1 && utilMonthName <= selectedMonth2;
            } else {
              // Wraps around year end (e.g., Dec to Jan)
              return utilMonthName >= selectedMonth1 || utilMonthName <= selectedMonth2;
            }
          }).map(util => ({
            ...util,
            // Ensure Timesheet data is properly formatted with month names
            Timesheet: {
              date: util.Timesheet?.date || new Date(util.createdAt).toISOString().split('T')[0],
              year: util.Timesheet?.year || new Date(util.createdAt).getFullYear(),
              month: months[new Date(util.Timesheet?.date || util.createdAt).getMonth()], // Store month name
              day: util.Timesheet?.day || new Date(util.createdAt).getDate()
            },
            Worktype: {
              worktype: util.Worktype?.worktype || 'chargeable'
            }
          }));
          
        } catch (error) {
          console.error(`Error fetching utilizations for employee ${emp.id}:`, error);
          utilMap[emp.id] = [];
        }
      }
      
      setUtilizations(utilMap);
    }

    if (employees.length > 0) {
      fetchAllUtilizations();
    }
  }, [employees, selectedMonth1, selectedMonth2, selectedYear]);

  useEffect(() => {
    // Determine the start and end dates for the selected *display* period.
    const startMonthIndex = months.indexOf(selectedMonth1);
    const endMonthIndex = months.indexOf(selectedMonth2);

    const periodStartDate = new Date(selectedYear, startMonthIndex, 1);
    // Ensure periodEndDate is the last day of the end month, correctly handling year wrap
    let periodEndDate = new Date(selectedYear, endMonthIndex + 1, 0); // Last day of the end month

     if (startMonthIndex > endMonthIndex) {
         // If the range wraps around the year (e.g., Dec to Jan)
         periodEndDate = new Date(selectedYear + 1, endMonthIndex + 1, 0); // Last day of the end month in the *next* year
     }

    console.log('Generating weeks for period:', {
      selectedMonth1,
      selectedMonth2, 
      selectedYear,
      periodStartDate: periodStartDate.toISOString(),
      periodEndDate: periodEndDate.toISOString()
    });

    const weeks1 = generateWeeksAroundMonth(selectedMonth1, selectedYear);
    const weeks2 = generateWeeksAroundMonth(selectedMonth2, selectedYear);

    // Combine weeks and ensure uniqueness based on week start date
     const combinedWeeks = [...weeks1, ...weeks2];

     const uniqueWeeksMap = new Map();
     combinedWeeks.forEach(week => {
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
                // Wraps around year (e.g., Dec to Jan)
                return startMonth >= startMonthIndex || startMonth <= endMonthIndex;
            }
        } else if (startMonthIndex > endMonthIndex && startYear === selectedYear + 1) {
            // Handle year wrap for the next year part
            return startMonth <= endMonthIndex;
        }
        
        return false;
    });

     // Sort weeks chronologically
     relevantWeeks.sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());

    console.log('Generated weeks:', relevantWeeks.map(w => ({
      label: w.label,
      year: w.year,
      month: w.month,
      weekStartDate: w.weekStartDate.toISOString(),
      calculatedWeekNumber: getWeekOfMonth(w.weekStartDate)
    })));

    setWeeks(relevantWeeks);

  }, [selectedMonth1, selectedMonth2, selectedYear]);

  // Helper function to check if employee is currently on leave (7-day period from leave date)
  const isEmployeeCurrentlyOnLeave = (employee) => {
    // Get the employee's leave date
    const leaveDates = employeeChanges[employee.id]?.expectedLeave ?? employee.leaves_expected;
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

  // Calculate total utilization for each week
  const calculateWeeklyTotals = () => {
    const weeklyTotals = {};
    
    weeks.forEach(week => {
      let totalPercentage = 0;
      let employeeCount = 0;
      
      filteredEmployees.forEach(employee => {
        const util = findUtilization(employee.id, week) || {};
        const cellId = `${employee.id}-${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
        const hasUnsavedChanges = unsavedChanges[cellId];
        
        // Use unsaved changes if available, otherwise use saved data
        const percentage = hasUnsavedChanges ? 
          hasUnsavedChanges.percentage : 
          (util.percentage || 0);
        
        if (percentage > 0) {
          totalPercentage += percentage;
          employeeCount++;
        }
      });
      
      weeklyTotals[week.label] = {
        total: totalPercentage,
        count: employeeCount,
        average: employeeCount > 0 ? Math.round(totalPercentage / employeeCount) : 0
      };
    });
    
    return weeklyTotals;
  };

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalEmployees: employees.length,
      averageUtilization: 0,
      averageBillableUtilization: 0,
      chargeableWork: 0,
      nonChargeableWork: 0,
      onLeave: 0,
      inTraining: 0
    };

    let totalUtilization = 0;
    let totalEntries = 0;
    let employeeChargeabilitySum = 0;
    let employeesWithData = 0;

    // Count employees currently on leave based on their leave dates (7-day period)
    employees.forEach(employee => {
      if (isEmployeeCurrentlyOnLeave(employee)) {
        stats.onLeave++;
      }
    });

    employees.forEach(employee => {
      const employeeUtil = utilizations[employee.id] || [];
      let employeeChargeablePercentage = 0; // Sum of chargeable percentages
      let employeeTotalWeeks = weeks.length; // Count ALL weeks in the selected month(s)
      let employeeUtilSum = 0;
      let employeeUtilEntries = 0;

      weeks.forEach(week => {
        // Check if this employee has any utilization data for this week
        const weekStartDate = formatDateToYYYYMMDD(week.weekStartDate);
        const weekUtil = employeeUtil.find(util => 
          util.Timesheet?.date === weekStartDate
        );

        if (weekUtil) {
          const percentage = Number(weekUtil.percentage) || 0;
          employeeUtilSum += percentage;
          employeeUtilEntries++;

          // Check work type and add to appropriate counter
          const workTypeKey = getWorkTypeKey(weekUtil.Worktype?.worktype);
          if (workTypeKey === 'chargeable') {
            // Add the actual percentage of chargeability (e.g., 50% = 0.5)
            employeeChargeablePercentage += percentage / 100;
            stats.chargeableWork++;
          } else {
            switch(workTypeKey) {
              case 'nonChargeable':
                stats.nonChargeableWork++;
                break;
              case 'leave':
                // Note: This counts leave entries in utilization data, 
                // separate from current leave status
                break;
              case 'training':
                stats.inTraining++;
                break;
            }
          }
        } else {
          // No utilization data for this week - treat as 0% chargeable
          // This ensures all weeks in the selected month(s) are counted
          employeeChargeablePercentage += 0;
        }
      });

      // Calculate this employee's chargeability percentage
      // Average chargeable percentage across ALL weeks in the selected month(s)
      if (employeeTotalWeeks > 0) {
        const employeeChargeability = (employeeChargeablePercentage / employeeTotalWeeks) * 100;
        employeeChargeabilitySum += employeeChargeability;
        employeesWithData++;
      }

      // Add to overall utilization calculation
      totalUtilization += employeeUtilSum;
      totalEntries += employeeUtilEntries;
    });

    // Calculate average billable utilization (average of each employee's chargeability across ALL weeks)
    stats.averageBillableUtilization = employeesWithData > 0 ? 
      (employeeChargeabilitySum / employeesWithData).toFixed(1) : 0;

    // Calculate overall average utilization (all utilization percentages averaged)
    stats.averageUtilization = totalEntries > 0 ? (totalUtilization / totalEntries).toFixed(1) : 0;
    
    return stats;
  };

  // Helper to map backend worktype to frontend key
  function getWorkTypeKey(worktype) {
    if (!worktype) return 'chargeable';
    if (worktype === 'chargeable') return 'chargeable';
    if (worktype === 'non-chargeable') return 'nonChargeable';
    if (worktype === 'annual leave') return 'leave';
    if (worktype === 'training') return 'training';
    return 'chargeable'; // Default or handle unknown types
  }

   // Helper to find utilization for a specific employee and week object with improved date matching
   const findUtilization = (employeeId, week) => {
      const employeeUtil = utilizations[employeeId] || [];
      const weekStartDate = formatDateToYYYYMMDD(week.weekStartDate);
      
      
      // Find all utilizations that match the week's start date
      const matchingUtils = employeeUtil.filter(util => {
        const utilDate = util.Timesheet?.date;
        if (!utilDate) return false;
        
        // Compare dates directly
        return utilDate === weekStartDate;
      });
      
      // If multiple records exist, return the latest one (most recent updatedAt)
      if (matchingUtils.length > 0) {
        const latestUtil = matchingUtils.reduce((latest, current) => {
          const latestDate = new Date(latest.updatedAt || latest.createdAt);
          const currentDate = new Date(current.updatedAt || current.createdAt);
          return currentDate > latestDate ? current : latest;
        });
        
        console.log(`Found ${matchingUtils.length} matching records for date ${weekStartDate}, returning latest:`, {
          id: latestUtil.id,
          percentage: latestUtil.percentage,
          worktype: latestUtil.Worktype?.worktype,
          date: latestUtil.Timesheet?.date,
          updatedAt: latestUtil.updatedAt
        });
        
        return latestUtil;
      }
      

      return null;
   };

   // Handler for percentage input change - tracks both percentage and worktype
   const handlePercentageChange = (employeeId, week, value) => {
       const cellId = `${employeeId}-${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
       
       // Update local editing state immediately
       setEditingCellId(cellId);
       setEditingPercentage(value);
       
       // Get current data
       const currentUtil = findUtilization(employeeId, week);
       const newValue = Number(value) || 0;
       
       // Update or create unsaved changes for this cell
       setUnsavedChanges(prev => ({
           ...prev,
           [cellId]: {
               employeeId,
               week,
               percentage: newValue,
               worktypeId: prev[cellId]?.worktypeId || currentUtil?.worktypeId || 1,
               worktype: prev[cellId]?.worktype || currentUtil?.Worktype?.worktype || 'chargeable',
               projectname: prev[cellId]?.projectname || currentUtil?.projectname || 'Resource Tracker',
               expected_finish_date: prev[cellId]?.expected_finish_date || currentUtil?.expected_finish_date || new Date().toISOString().split('T')[0],
               leaves_expected: prev[cellId]?.leaves_expected || currentUtil?.leaves_expected || 0,
               ksa_status: prev[cellId]?.ksa_status || currentUtil?.ksa_status || 'No'
           }
       }));
   };

   // Handler for work type change - tracks both worktype and percentage
   const handleWorkTypeChange = async (worktypeKey) => {
       if (!selectedCell) return;

       const { employeeId, weekData } = selectedCell;
       const cellId = `${employeeId}-${weekData.year}-${weekData.month}-${getWeekOfMonth(weekData.weekStartDate)}`;
       const currentUtil = findUtilization(employeeId, weekData);

       // Map the worktype key to the correct ID
       const worktypeId = worktypeIdMap[worktypeKey === 'nonChargeable' ? 'non-chargeable' : 
                          worktypeKey === 'leave' ? 'annual leave' : worktypeKey];

       if (!worktypeId) {
           console.error('Invalid worktype key:', worktypeKey);
           showToast('Invalid work type selected', 'error');
           return;
       }

       // Update or create unsaved changes for this cell
       setUnsavedChanges(prev => ({
           ...prev,
           [cellId]: {
               employeeId,
               week: weekData,
               percentage: prev[cellId]?.percentage || currentUtil?.percentage || 0,
               worktypeId: worktypeId,
               worktype: worktypeKey === 'nonChargeable' ? 'non-chargeable' : 
                         worktypeKey === 'leave' ? 'annual leave' : worktypeKey,
               projectname: prev[cellId]?.projectname || currentUtil?.projectname || 'Resource Tracker',
               expected_finish_date: prev[cellId]?.expected_finish_date || currentUtil?.expected_finish_date || new Date().toISOString().split('T')[0],
               leaves_expected: prev[cellId]?.leaves_expected || currentUtil?.leaves_expected || 0,
               ksa_status: prev[cellId]?.ksa_status || currentUtil?.ksa_status || 'No'
           }
       }));

       showToast('Work type selected - enter percentage and save changes', 'info');

       // Focus the input for percentage entry
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

   // Save employee changes
   const saveEmployeeChanges = async () => {
       const employeeIds = Object.keys(employeeChanges);
       if (employeeIds.length === 0) {
           showToast('No employee changes to save', 'info');
           return;
       }

       let savedCount = 0;
       let errorCount = 0;
       let utilizationUpdatedCount = 0;

       for (const employeeId of employeeIds) {
           try {
               const changes = employeeChanges[employeeId];
               const employee = employees.find(emp => emp.id === parseInt(employeeId));
               
               if (!employee) {
                   console.error(`Employee ${employeeId} not found`);
                   continue;
               }

               // Prepare the complete employee update payload with correct field names
               const backendChanges = {
                   name: employee.name,
                   email: employee.email,
                   position: employee.position,
                   department: employee.department,
                   expertise: employee.expertise,
                   // Use the correct field names as per API response
                   leaves_expected: changes.expectedLeave || employee.leaves_expected || '0',
                   ksa_status: changes.ableToWorkInKSA ? 'Yes' : 'No' || employee.ksa_status || 'No'
               };

               // Update employee data using the correct endpoint
               const response = await axios.put(`/api1/employees/${employeeId}`, backendChanges);
               
               if (response.data) {
                   // Update local employee state with the response data
                   setEmployees(prev => prev.map(emp => 
                       emp.id === parseInt(employeeId) ? { 
                           ...emp, 
                           ...response.data,
                           // Keep any unsaved changes that weren't part of this update
                           ...changes
                       } : emp
                   ));
                   savedCount++;

                   // If there's a chargeable project or duration change, update the utilization
                   if (changes.chargeableProjects || changes.duration) {
                       const employeeUtils = utilizations[employeeId] || [];
                       if (employeeUtils.length > 0) {
                           // Sort utilizations by date to get the latest
                           const sortedUtils = [...employeeUtils].sort((a, b) => {
                               const dateA = new Date(a.Timesheet?.date || a.createdAt);
                               const dateB = new Date(b.Timesheet?.date || b.createdAt);
                               return dateB - dateA;
                           });

                           // Get the latest utilization record
                           const latestUtil = sortedUtils[0];
                           if (latestUtil) {
                               // Update the utilization with the new projectname and duration
                               const updateData = {
                                   employeeId: parseInt(employeeId),
                                   date: latestUtil.Timesheet.date,
                                   worktypeId: latestUtil.worktypeId,
                                   percentage: latestUtil.percentage,
                                   projectname: changes.chargeableProjects || latestUtil.projectname,
                                   expected_finish_date: changes.duration || latestUtil.expected_finish_date || ' '
                               };

                               try {
                                   const utilResponse = await axios.put(
                                       `/api1/utilization/${latestUtil.id}`,
                                       updateData
                                   );

                                   if (utilResponse.data) {
                                       // Update local utilization state
                                       setUtilizations(prev => {
                                           const newUtilMap = { ...prev };
                                           const employeeUtils = [...(newUtilMap[employeeId] || [])];
                                           const existingIndex = employeeUtils.findIndex(util => 
                                               util.id === latestUtil.id
                                           );

                                           if (existingIndex > -1) {
                                               employeeUtils[existingIndex] = {
                                                   ...utilResponse.data,
                                                   Timesheet: latestUtil.Timesheet,
                                                   Worktype: latestUtil.Worktype
                                               };
                                           }
                                           newUtilMap[employeeId] = employeeUtils;
                                           return newUtilMap;
                                       });
                                       utilizationUpdatedCount++;
                                   }
                               } catch (error) {
                                   console.error('Error updating utilization:', error);
                                   errorCount++;
                               }
                           }
                       }
                   }
               }
           } catch (error) {
               console.error(`Error updating employee ${employeeId}:`, error);
               errorCount++;
           }
       }

       // Clear employee changes after successful save
       if (savedCount > 0 || utilizationUpdatedCount > 0) {
           setEmployeeChanges({});
           
           // Show appropriate success message
           if (savedCount > 0 && utilizationUpdatedCount > 0) {
               showToast(`${savedCount} employee records and ${utilizationUpdatedCount} utilization records updated successfully!`, 'success');
           } else if (savedCount > 0) {
               showToast(`${savedCount} employee records updated successfully!`, 'success');
           } else if (utilizationUpdatedCount > 0) {
               showToast(`${utilizationUpdatedCount} utilization records updated successfully!`, 'success');
           }
       }
       
       if (errorCount > 0) {
           showToast(`${errorCount} updates failed`, 'error');
       }
   };

  // Handler for selecting a cell (for work type or copy/paste)
  const handleCellSelect = (employeeId, weekLabel, weekData) => {
       setSelectedCell({ employeeId, weekLabel, weekData });
        // Optional: If clicking a cell should also focus the input
        // We are handling input focus via direct click now.
   };

  const stats = calculateStats();

  // Get unique expertise areas for filters
  const expertiseAreas = ['all', ...new Set(employees.map(emp => emp.expertise))];

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const expertiseMatch = filters.expertise === 'all' || emp.expertise === filters.expertise;
    return expertiseMatch;
  });

  const weeklyTotals = calculateWeeklyTotals();

  // Helper to get work type color class
  const getWorkTypeColor = (worktype) => {
      const workTypeKey = getWorkTypeKey(worktype);
      return workTypes[workTypeKey]?.color || '';
  };

   // Check if a cell is selected
   const isCellSelected = (employeeId, weekLabel) => {
       return selectedCell?.employeeId === employeeId && selectedCell?.weekLabel === weekLabel;
   };

  // Add keyboard event listeners for Excel-like functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when not typing in an input
      if (e.target.tagName === 'INPUT') return;
      
      if (e.ctrlKey && e.key === 'c' && selectedCellId) {
        e.preventDefault();
        handleCopyWithKeyboard();
      } else if (e.ctrlKey && e.key === 'v' && selectedCellId && copiedCellData) {
        e.preventDefault();
        handlePasteWithKeyboard();
      } else if (e.key === 'Escape') {
        // Clear selection and copied data
        setSelectedCellId(null);
        setCopiedCellData(null);
        setCopiedCellId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCellId, copiedCellData]);

  // Excel-like copy function
  const handleCopyWithKeyboard = () => {
    if (!selectedCellId) return;
    
    const [employeeId, year, month, weekNumber] = selectedCellId.split('-').map(Number);
    const week = weeks.find(w => 
      w.year === year && 
      w.month === month && 
      getWeekOfMonth(w.weekStartDate) === weekNumber
    );
    
    if (!week) return;
    
    const util = findUtilization(employeeId, week);
    const cellData = {
      percentage: util?.percentage || 0,
      worktypeId: util?.worktypeId || 1,
      worktype: util?.Worktype?.worktype || 'chargeable',
      projectname: util?.projectname || 'N/A',
      expected_finish_date: util?.expected_finish_date || new Date().toISOString().split('T')[0],
      leaves_expected: util?.leaves_expected || 0,
      ksa_status: util?.ksa_status || 'No'
    };
    
    setCopiedCellData(cellData);
    setCopiedCellId(selectedCellId);
    
    // Show visual feedback
    const employeeName = employees.find(emp => emp.id === employeeId)?.name || 'Unknown';
    console.log(`Copied: ${cellData.percentage}% ${cellData.worktype} for ${employeeName} - week ${week.label}`);
    
    // You could add a toast notification here for better UX
  };

  // Handle cell click for selection
  const handleCellClick = (employeeId, week, e) => {
    // Don't select if clicking on input
    if (e.target.tagName === 'INPUT') return;
    
    const cellId = `${employeeId}-${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
    const util = findUtilization(employeeId, week) || {};
    const hasData = util.percentage > 0 || util.Worktype?.worktype;
    
    setSelectedCellId(cellId);
    setSelectedCell({ employeeId, weekLabel: week.label, weekData: week });
    
    // If cell has data and user clicks it, automatically start editing
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

  // Excel-like paste function
  const handlePasteWithKeyboard = async () => {
    if (!selectedCellId || !copiedCellData) return;
    
    const [employeeId, year, month, weekNumber] = selectedCellId.split('-').map(Number);
    const week = weeks.find(w => 
      w.year === year && 
      w.month === month && 
      getWeekOfMonth(w.weekStartDate) === weekNumber
    );
    
    if (!week) return;
    
    // Map worktype back to worktypeId
    const worktypeIdMap = {
      'chargeable': 1,
      'non-chargeable': 2,
      'annual leave': 3,
      'training': 4
    };
    
    const worktypeId = worktypeIdMap[copiedCellData.worktype] || copiedCellData.worktypeId || 1;
    
    // Prepare complete data for pasting - day-based format
    const pasteData = {
      employeeId: employeeId,
      date: formatDateToYYYYMMDD(week.weekStartDate),
      worktypeId: worktypeId,
      percentage: copiedCellData.percentage,
      projectname: copiedCellData.projectname || 'Resource Tracker',
      expected_finish_date: copiedCellData.expected_finish_date || formatDateToYYYYMMDD(new Date()),
      leaves_expected: copiedCellData.leaves_expected || 0,
      ksa_status: copiedCellData.ksa_status || 'No'
    };
    
    // Update local state immediately with both percentage and worktype
    setUtilizations(prev => {
      const newUtilMap = { ...prev };
      const employeeUtils = [...(newUtilMap[employeeId] || [])];
      const existingIndex = employeeUtils.findIndex(util =>
        util.Timesheet?.date === pasteData.date
      );

      const formattedUtil = {
        ...pasteData,
        Timesheet: { 
          date: pasteData.date,
          year: week.year, 
          month: week.month, 
          day: new Date(pasteData.date).getDate()
        },
        Worktype: { worktype: copiedCellData.worktype }
      };

      if (existingIndex > -1) {
        employeeUtils[existingIndex] = formattedUtil;
      } else {
        employeeUtils.push(formattedUtil);
      }
      newUtilMap[employeeId] = employeeUtils;
      return newUtilMap;
    });

    // Post to backend
    const response = await postUtilization(pasteData);

    if (response) {
      // Update state with backend response
      const formattedResponse = {
        ...response,
        Timesheet: {
          date: pasteData.date,
          year: week.year,
          month: week.month,
          day: new Date(pasteData.date).getDate()
        },
        Worktype: {
          worktype: response.worktypeId === 1 ? 'chargeable' : 
                   response.worktypeId === 2 ? 'non-chargeable' : 
                   response.worktypeId === 3 ? 'annual leave' : 'training'
        }
      };
      
      setUtilizations(prev => {
        const newUtilMap = { ...prev };
        const employeeUtils = [...(newUtilMap[employeeId] || [])];
        const existingIndex = employeeUtils.findIndex(util =>
          util.Timesheet?.date === pasteData.date
        );
        if (existingIndex > -1) {
          employeeUtils[existingIndex] = formattedResponse;
        } else {
          employeeUtils.push(formattedResponse);
        }
        newUtilMap[employeeId] = employeeUtils;
        return newUtilMap;
      });
      
      // Show visual feedback
      const employeeName = employees.find(emp => emp.id === employeeId)?.name || 'Unknown';
      console.log(`Pasted: ${copiedCellData.percentage}% ${copiedCellData.worktype} to ${employeeName} - week ${week.label}`);
    } else {
      console.error('Failed to paste utilization data');
    }
  };

  // Open detailed edit modal
  const openDetailedEdit = (employeeId, week) => {
      const cellId = `${employeeId}-${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
      const currentUtil = findUtilization(employeeId, week);
      const unsavedData = unsavedChanges[cellId];
      
      // Use unsaved changes if available, otherwise use saved data
      const editData = {
          cellId,
          employeeId,
          week,
          percentage: unsavedData?.percentage || currentUtil?.percentage || 0,
          worktypeId: unsavedData?.worktypeId || currentUtil?.worktypeId || 1,
          worktype: unsavedData?.worktype || currentUtil?.Worktype?.worktype || 'chargeable',
          projectname: unsavedData?.projectname || currentUtil?.projectname || 'Resource Tracker',
          expected_finish_date: unsavedData?.expected_finish_date || currentUtil?.expected_finish_date || new Date().toISOString().split('T')[0],
          leaves_expected: unsavedData?.leaves_expected || currentUtil?.leaves_expected || 0,
          ksa_status: unsavedData?.ksa_status || currentUtil?.ksa_status || 'No'
      };
      
      setDetailedEditData(editData);
      setShowDetailedEdit(true);
  };

  // Handle detailed edit changes
  const handleDetailedEditChange = (field, value) => {
      setDetailedEditData(prev => ({
          ...prev,
          [field]: value
      }));
  };

  // Save detailed edit changes
  const saveDetailedEdit = () => {
      if (!detailedEditData) return;
      
      const { cellId, employeeId, week, ...editData } = detailedEditData;
      
      // Update unsaved changes
      setUnsavedChanges(prev => ({
          ...prev,
          [cellId]: {
              employeeId,
              week,
              ...editData
          }
      }));
      
      setShowDetailedEdit(false);
      showToast('Changes saved to pending. Click "Save All Changes" to persist.', 'info');
  };

  // Update the getEmployeeFieldValue function to handle the correct field names
  const getEmployeeFieldValue = (employee, fieldName) => {
      // Map frontend field names to backend field names
      const fieldMapping = {
          'expectedLeave': 'leaves_expected',
          'ableToWorkInKSA': 'ksa_status'
      };

      const backendFieldName = fieldMapping[fieldName] || fieldName;
      const value = employeeChanges[employee.id]?.[fieldName] ?? employee[backendFieldName] ?? '';

      // For ksa_status, convert 'Yes'/'No' to boolean for the select input
      if (fieldName === 'ableToWorkInKSA') {
          return value === 'Yes';
      }

      return value;
  };

  // Update the handleEmployeeFieldChange function to handle the correct field names
  const handleEmployeeFieldChange = (employeeId, fieldName, value) => {
      // For ksa_status, convert boolean to 'Yes'/'No'
      const processedValue = fieldName === 'ableToWorkInKSA' ? (value ? 'Yes' : 'No') : value;

      setEmployeeChanges(prev => ({
          ...prev,
          [employeeId]: {
              ...prev[employeeId],
              [fieldName]: processedValue
          }
      }));
  };

  // Add this helper function to get the latest projectname for an employee
  const getLatestProjectName = (employeeId) => {
      const employeeUtils = utilizations[employeeId] || [];
      if (employeeUtils.length === 0) return '';

      // Sort utilizations by date in descending order and get the latest one with a projectname
      const sortedUtils = [...employeeUtils].sort((a, b) => {
          const dateA = new Date(a.Timesheet?.date || a.createdAt);
          const dateB = new Date(b.Timesheet?.date || b.createdAt);
          return dateB - dateA;
      });

      // Find the first utilization with a non-empty projectname
      const latestUtil = sortedUtils.find(util => util.projectname && util.projectname !== 'Resource Tracker');
      return latestUtil?.projectname || '';
  };

  // Add a helper function to get the latest duration for an employee
  const getLatestDuration = (employeeId) => {
      const employeeUtils = utilizations[employeeId] || [];
      if (employeeUtils.length === 0) return '';

      // Sort utilizations by date in descending order and get the latest one with a duration
      const sortedUtils = [...employeeUtils].sort((a, b) => {
          const dateA = new Date(a.Timesheet?.date || a.createdAt);
          const dateB = new Date(b.Timesheet?.date || b.createdAt);
          return dateB - dateA;
      });

      // Find the first utilization with a non-empty expected_finish_date
      const latestUtil = sortedUtils.find(util => util.expected_finish_date && util.expected_finish_date !== ' ');
      return latestUtil?.expected_finish_date || '';
  };

  // Save all unsaved changes
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
              // Validate percentage
              if (change.percentage < 0 || change.percentage > 100) {
                  showToast(`Invalid percentage ${change.percentage}% for cell ${cellId}`, 'error');
                  errorCount++;
                  continue;
              }

              // Find existing utilization to determine if this is an update
              const existingUtil = findUtilization(change.employeeId, change.week);
              const isUpdate = !!existingUtil;

              // Get the employee's chargeable projects and duration from employeeChanges
              const employeeChange = employeeChanges[change.employeeId] || {};
              const chargeableProjects = employeeChange.chargeableProjects || '';
              const duration = employeeChange.duration || '';

              // Prepare the data for API call - only include utilization-specific fields
              const updatedUtilData = {
                  employeeId: change.employeeId,
                  date: formatDateToYYYYMMDD(change.week.weekStartDate),
                  worktypeId: change.worktypeId,
                  percentage: change.percentage,
                  projectname: chargeableProjects || 'Resource Tracker', // Use chargeableProjects as projectname
                  expected_finish_date: duration || ' ', // Store duration directly as string, use space as default
                  ...(isUpdate && { id: existingUtil.id }) // Include ID for updates
              };

              // Make API call
              const response = await postUtilization(updatedUtilData, isUpdate);

              if (response) {
                  // Update state with backend response
                  const formattedResponse = {
                      ...response,
                      Timesheet: {
                          date: updatedUtilData.date,
                          year: change.week.year,
                          month: change.week.month,
                          day: new Date(updatedUtilData.date).getDate()
                      },
                      Worktype: {
                          worktype: response.worktypeId === 1 ? 'chargeable' : 
                                  response.worktypeId === 2 ? 'non-chargeable' : 
                                  response.worktypeId === 3 ? 'annual leave' : 'training'
                      }
                  };

                  setUtilizations(prev => {
                      const newUtilMap = { ...prev };
                      const employeeUtils = [...(newUtilMap[change.employeeId] || [])];
                      const existingIndex = employeeUtils.findIndex(util =>
                          util.Timesheet?.date === updatedUtilData.date
                      );

                      if (existingIndex > -1) {
                          employeeUtils[existingIndex] = formattedResponse;
                      } else {
                          employeeUtils.push(formattedResponse);
                      }
                      newUtilMap[change.employeeId] = employeeUtils;
                      return newUtilMap;
                  });

                  // Clear the employee changes for chargeableProjects and duration after successful save
                  if (employeeChange.chargeableProjects || employeeChange.duration) {
                      setEmployeeChanges(prev => ({
                          ...prev,
                          [change.employeeId]: {
                              ...prev[change.employeeId],
                              chargeableProjects: undefined,
                              duration: undefined
                          }
                      }));
                  }

                  savedCount++;
              } else {
                  throw new Error('Failed to save utilization');
              }
          } catch (error) {
              console.error(`Error saving change for cell ${cellId}:`, error);
              errorCount++;
          }
      }

      // Clear all saved changes
      if (savedCount > 0) {
          setUnsavedChanges({});
          showToast(`${savedCount} utilization records updated successfully!`, 'success');
      }
      
      if (errorCount > 0) {
          showToast(`${errorCount} updates failed`, 'error');
      }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <SidebarToggle onToggle={toggleSidebar} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">Resource Utilization Tracker</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center">
              <select
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                value={selectedMonth1}
                onChange={(e) => setSelectedMonth1(e.target.value)}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <span className="text-blue-600 font-semibold px-2">to</span>
                              <select
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                  value={selectedMonth2}
                  onChange={(e) => setSelectedMonth2(e.target.value)}
                >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <select
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
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
        <div className="bg-white border border-gray-200 p-6 rounded-xl mb-4 shadow-lg">
            <div className="grid grid-cols-4 gap-6 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">Average Billable Utilization</div>
                <div className="text-3xl font-bold text-blue-700">{stats.averageBillableUtilization}%</div>
                <div className="text-xs text-gray-500 mt-1">Per Week</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">Average Utilization</div>
                <div className="text-3xl font-bold text-green-700">{stats.averageUtilization}%</div>
                <div className="text-xs text-gray-500 mt-1">Per Week</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">On Leave</div>
                <div className="text-3xl font-bold text-red-700">{stats.onLeave}</div>
                <div className="text-xs text-gray-500 mt-1">Employees</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2 font-medium">Available Hours</div>
                <div className="text-3xl font-bold text-gray-700">40</div>
                <div className="text-xs text-gray-500 mt-1">Per Week</div>
              </div>
            </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm flex-wrap">
          {Object.entries(workTypes).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30 shadow-sm hover:shadow-md transition-all duration-200">
              <div className={`w-5 h-5 ${color} rounded-lg shadow-sm`}></div>
              <span className="font-semibold text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6">
                  <div className="flex gap-4">
            <select
              className="px-4 py-2 border-2 border-indigo-200 rounded-lg text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200"
              value={filters.expertise}
              onChange={(e) => setFilters(prev => ({ ...prev, expertise: e.target.value }))}
            >
            {expertiseAreas.map(exp => (
              <option key={exp} value={exp}>{exp === 'all' ? 'All Expertise Areas' : exp}</option>
            ))}
          </select>
        </div>
      </div>

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
              {/* Weekly Totals Row */}
              <tr className="bg-gradient-to-r from-white via-green-50 to-green-100 border-b-2 border-green-200">
                <th className="border border-green-200 p-2 text-xs font-bold text-center sticky left-0 bg-gradient-to-r from-white to-green-50 z-20 min-w-[120px]">
                  <div className="text-green-700">WEEKLY AVERAGE</div>
                </th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center sticky left-[120px] bg-gradient-to-r from-green-50 to-green-100 z-20 min-w-[100px]">
                  <div className="text-green-700">UTILIZATION</div>
                </th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[80px]"></th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[120px]"></th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[120px]"></th>
                {weeks.map(week => {
                  const weekTotal = weeklyTotals[week.label] || { total: 0, count: 0, average: 0 };
                  return (
                    <th key={`total-${week.label}`} className="border border-green-200 p-2 text-xs font-bold text-center min-w-[80px] bg-gradient-to-br from-white to-green-100">
                      <div className="text-green-700">
                        <div className="font-bold text-lg">{weekTotal.average}%</div>
                      </div>
                    </th>
                  );
                })}
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[200px]"></th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[100px]"></th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[80px]"></th>
                <th className="border border-green-200 p-2 text-xs font-bold text-center min-w-[80px]"></th>
              </tr>
              
              {/* Regular Header Row */}
              <tr className="bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-100 border-b border-indigo-200">
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left sticky left-0 bg-gradient-to-r from-slate-100 to-blue-100 z-20 min-w-[120px]">Name</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left sticky left-[120px] bg-gradient-to-r from-blue-100 to-indigo-100 z-20 min-w-[100px]">Position</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[80px]">Location</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[120px]">KSA Solution</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[120px]">Area of Expertise</th>
                                  {weeks.map(week => (
                    <th key={week.label} className="border border-indigo-200 p-2 text-xs text-gray-700 font-bold text-center min-w-[80px] bg-gradient-to-br from-blue-50 to-indigo-100">
                      <div className="text-indigo-700">{week.label}</div>
                    </th>
                  ))}
                <th className="border border-indigo-200 p-3 text-sm font-bold text-left min-w-[200px]">Chargeable Projects / Comments</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-center min-w-[100px]">Leaves Expected</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-center min-w-[80px]">Able to work in KSA</th>
                <th className="border border-indigo-200 p-3 text-sm font-bold text-center min-w-[80px]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
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
                    const util = findUtilization(employee.id, week) || {};
                    const cellId = `${employee.id}-${week.year}-${week.month}-${getWeekOfMonth(week.weekStartDate)}`;
                    const isSelected = selectedCellId === cellId;
                    const isCopied = copiedCellId === cellId;
                    const isEditing = editingCellId === cellId;
                    const hasUnsavedChanges = unsavedChanges[cellId];
                    
                    // Use unsaved changes if available, otherwise use saved data
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
                        className={`border border-gray-200 p-1 relative group transition-all duration-200 cursor-pointer text-center
                          ${cellBgColor} 
                          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : ''} 
                          ${isCopied ? 'ring-2 ring-green-500 bg-green-100' : ''}
                          ${isEditing ? 'ring-2 ring-orange-500' : ''}
                          ${hasUnsavedChanges ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}
                          hover:bg-blue-50
                        `}
                        onClick={(e) => handleCellClick(employee.id, week, e)}
                        tabIndex={0}
                      >
                        {/* Input field - only show when editing or when cell is selected but has no data */}
                        {(isEditing || (isSelected && !hasData)) ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingCellId === cellId ? editingPercentage : (displayData.percentage || '')}
                            onChange={(e) => handlePercentageChange(employee.id, week, e.target.value)}
                            onFocus={(e) => {
                               setEditingCellId(cellId);
                               setEditingPercentage(String(displayData.percentage || ''));
                               setSelectedCellId(cellId);
                               e.target.select();
                            }}
                            className={`w-full bg-transparent text-center focus:outline-none text-sm font-bold cursor-text ${
                              hasUnsavedChanges ? 'text-orange-600' : ''
                            }`}
                            placeholder="0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : hasData ? (
                          // Show percentage display for cells with data when not editing
                          <div className="w-full text-center py-2">
                            <span className={`text-sm font-bold ${hasUnsavedChanges ? 'text-orange-600' : 'text-gray-800'}`}>
                              {displayData.percentage}%
                            </span>
                          </div>
                        ) : (
                          // Empty cell - show placeholder text
                          <div className={`w-full text-center text-sm py-2 ${
                            isSelected ? 'text-blue-600 font-medium' : 'text-gray-400'
                          }`}>
                            {isSelected ? 'Select type ↓' : '0%'}
                          </div>
                        )}
                        
                        {/* Unsaved changes indicator */}
                        {hasUnsavedChanges && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                        )}
                      </td>
                    );
                  })}
                  <td className="border border-gray-200 p-3 text-sm">
                    <input
                      type="text"
                      value={employeeChanges[employee.id]?.chargeableProjects ?? getLatestProjectName(employee.id)}
                      onChange={(e) => handleEmployeeFieldChange(employee.id, 'chargeableProjects', e.target.value)}
                      className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 ${
                        employeeChanges[employee.id]?.chargeableProjects !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                      placeholder="Enter project/comments"
                    />
                  </td>
                  <td className="border border-gray-200 p-3 text-sm text-center">
                    <input
                      type="text"
                      value={getEmployeeFieldValue(employee, 'expectedLeave')}
                      onChange={(e) => handleEmployeeFieldChange(employee.id, 'expectedLeave', e.target.value)}
                      className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-center ${
                        employeeChanges[employee.id]?.expectedLeave !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                      placeholder="e.g. 15 to 20 Aug"
                    />
                  </td>
                  <td className="border border-gray-200 p-3 text-sm text-center">
                    <select
                      value={getEmployeeFieldValue(employee, 'ableToWorkInKSA') ? 'Yes' : 'No'}
                      onChange={(e) => handleEmployeeFieldChange(employee.id, 'ableToWorkInKSA', e.target.value === 'Yes')}
                      className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-center ${
                        employeeChanges[employee.id]?.ableToWorkInKSA !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </td>
                  <td className="border border-gray-200 p-3 text-sm text-center">
                    <input
                      type="text"
                      value={employeeChanges[employee.id]?.duration ?? getLatestDuration(employee.id)}
                      onChange={(e) => handleEmployeeFieldChange(employee.id, 'duration', e.target.value)}
                      className={`w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-center ${
                        employeeChanges[employee.id]?.duration !== undefined ? 'bg-yellow-50 text-orange-600' : ''
                      }`}
                      placeholder="e.g. 6 Months"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600 font-medium">
            {selectedCell ? 
              `Select work type for ${employees.find(emp => emp.id === selectedCell.employeeId)?.name} - week ${selectedCell.weekLabel}` : 
              'Click on any cell above to select work type'
            }
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(workTypes).map(([key, { label, color }]) => (
              <button
                key={key}
                className={`px-4 py-2 border border-gray-200 ${color} rounded-md shadow-sm transition-all duration-200 text-sm font-medium ${
                  selectedCell ? 'hover:shadow-md cursor-pointer transform hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => handleWorkTypeChange(key)}
                disabled={!selectedCell}
              >
                {label}
              </button>
            ))}
          </div>
          {selectedCell && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => openDetailedEdit(selectedCell.employeeId, selectedCell.weekData)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                📝 Edit Details (Project, Dates, etc.)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="text-sm font-medium text-blue-800 mb-2">Instructions:</div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• <strong>Utilization:</strong> Click any cell to select it, then choose a work type from the buttons below</div>
          <div>• After selecting work type, click the cell again to enter percentage</div>
          <div>• <strong>Employee Fields:</strong> Click directly on any employee field (Projects, Leaves, KSA, Duration) to edit</div>
          <div>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Ctrl+C</kbd> to copy selected cell</div>
          <div>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Ctrl+V</kbd> to paste to selected cell</div>
          <div>• Changes are highlighted in yellow - use separate save buttons for utilization vs employee data</div>
          <div>• Use "Discard All Changes" to revert unsaved modifications</div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 
          toast.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ConsolidatedTracker; 