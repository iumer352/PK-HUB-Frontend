import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [employeeStats, setEmployeeStats] = useState({
    departmentData: [],
    roleData: [],
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employees');
      const employees = response.data;
      setEmployees(employees);
      
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

      // Update stats
      setEmployeeStats({
        departmentData: Object.entries(departmentGroups).map(([name, value]) => ({ name, value })),
        roleData: Object.entries(roleGroups).map(([name, value]) => ({ name, value })),
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.status === 'active').length,
        newHires: employees.filter(emp => {
          const hireDate = new Date(emp.joinDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return hireDate >= thirtyDaysAgo;
        }).length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employee data');
      setLoading(false);
    }
  };

  // Filter employees by department
  const filteredEmployees = selectedDepartment
    ? employees.filter(emp => emp.department === selectedDepartment)
    : employees;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-16 w-16 border-4 border-[#1e40af] rounded-full border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-center p-4"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1e40af]">Employee Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => navigate('/add-employee')}
            className="bg-[#1e40af] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Employee
          </button>
          <button
            onClick={() => navigate('/view-employees')}
            className="bg-[#1e40af] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg transition-colors"
          >
            View Schedule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#3b82f6] shadow-sm">
          <h3 className="text-sm font-medium text-[#1e40af]">Total Employees</h3>
          <p className="text-2xl font-bold text-[#3b82f6]">{employeeStats.totalEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#10b981] shadow-sm">
          <h3 className="text-sm font-medium text-[#1e40af]">Active Employees</h3>
          <p className="text-2xl font-bold text-[#10b981]">{employeeStats.activeEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#f59e0b] shadow-sm">
          <h3 className="text-sm font-medium text-[#1e40af]">New Hires (This Month)</h3>
          <p className="text-2xl font-bold text-[#f59e0b]">{employeeStats.newHires}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-lg border border-[#3b82f6] shadow-sm">
          <h3 className="text-sm font-medium text-[#1e40af] mb-2">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={employeeStats.departmentData || []}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                stroke="#1e40af"
                tick={{ fill: '#1e40af' }}
              />
              <YAxis 
                fontSize={10} 
                stroke="#1e40af"
                tick={{ fill: '#1e40af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#3b82f6] shadow-sm">
          <h3 className="text-sm font-medium text-[#1e40af] mb-2">Role Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={employeeStats.roleData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={45}
                fill="#3b82f6"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {(employeeStats.roleData || []).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index % 3 === 0 ? '#1e40af' : index % 3 === 1 ? '#10b981' : '#f59e0b'} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Department Filter */}
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDepartment(null)}
              className={`px-4 py-2 rounded ${!selectedDepartment ? 'bg-[#1e40af] text-white' : 'bg-[#3b82f6]'}`}
            >
              All
            </button>
            {employeeStats.departmentData.map(({ name }) => (
              <button
                key={name}
                onClick={() => setSelectedDepartment(name)}
                className={`px-4 py-2 rounded ${selectedDepartment === name ? 'bg-[#1e40af] text-white' : 'bg-[#3b82f6]'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Employee Directory</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredEmployees.map((employee, index) => (
                      <motion.tr
                        key={employee.id || employee._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="h-10 w-10 flex-shrink-0"
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] flex items-center justify-center text-white font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            </motion.div>
                            <div className="ml-4">
                              <div 
                                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                onClick={() => navigate(`/timesheet/${employee._id || employee.id}`)}
                              >
                                {employee.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#10b981] text-white"
                          >
                            {employee.department}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.projects ? employee.projects.length : 0} projects
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;