import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeStats, setEmployeeStats] = useState({
    departmentData: [],
    roleData: [],
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0
  });

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employee stats');
      }
      const employees = await response.json();
      
      // Process department distribution
      const departmentGroups = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {});

      // Process role distribution
      const roleGroups = employees.reduce((acc, emp) => {
        acc[emp.role] = (acc[emp.role] || 0) + 1;
        return acc;
      }, {});

      // Transform data for charts
      const departmentData = Object.entries(departmentGroups).map(([name, value]) => ({
        name,
        value
      }));

      const roleData = Object.entries(roleGroups).map(([name, value]) => ({
        name,
        value
      }));

      // Calculate statistics
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      setEmployeeStats({
        departmentData,
        roleData,
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.status === 'active').length,
        newHires: employees.filter(emp => new Date(emp.joinDate) >= startOfMonth).length
      });
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      setEmployeeStats({
        departmentData: [],
        roleData: [],
        totalEmployees: 0,
        activeEmployees: 0,
        newHires: 0
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/add-employee')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Employee
          </button>
          <button
            onClick={() => navigate('/view-employees')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            See Employee Schedule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Employees</h3>
          <p className="text-2xl font-bold">{employeeStats.totalEmployees}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Active Employees</h3>
          <p className="text-2xl font-bold">{employeeStats.activeEmployees}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">New Hires (This Month)</h3>
          <p className="text-2xl font-bold">{employeeStats.newHires}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Employees by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={employeeStats.departmentData || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Employees by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={employeeStats.roleData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {(employeeStats.roleData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;