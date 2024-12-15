import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Dummy data for testing
const dummyEmployees = [
  { _id: '1', name: 'John Doe', role: 'Software Engineer', department: 'Engineering', projects: [{ title: 'Project A' }, { title: 'Project B' }] },
  { _id: '2', name: 'Jane Smith', role: 'Product Manager', department: 'Product', projects: [{ title: 'Project C' }] },
  { _id: '3', name: 'Mike Johnson', role: 'UI Designer', department: 'Design', projects: [{ title: 'Project A' }] },
  { _id: '4', name: 'Sarah Williams', role: 'Software Engineer', department: 'Engineering', projects: [{ title: 'Project D' }] },
  { _id: '5', name: 'Tom Brown', role: 'DevOps Engineer', department: 'Engineering', projects: [{ title: 'Project E' }] },
  { _id: '6', name: 'Emily Davis', role: 'Product Manager', department: 'Product', projects: [{ title: 'Project F' }] },
  { _id: '7', name: 'David Wilson', role: 'UX Designer', department: 'Design', projects: [{ title: 'Project G' }] },
  { _id: '8', name: 'Lisa Anderson', role: 'Software Engineer', department: 'Engineering', projects: [{ title: 'Project H' }] },
];

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to fetch from API first
        try {
          const response = await axios.get('http://localhost:5000/api/employees');
          setEmployees(response.data);
        } catch {
          // If API fails, use dummy data
          setEmployees(dummyEmployees);
        }
        setLoading(false);
      } catch (err) {
        setError('Error fetching employees');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return (
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
        className="h-16 w-16 border-4 border-blue-500 rounded-full border-t-transparent"
      />
    </div>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-center p-4"
    >
      {error}
    </motion.div>
  );

  // Calculate summary statistics
  const departmentStats = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const roleStats = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {});

  // Chart data for departments (Pie Chart)
  const departmentChartData = {
    labels: Object.keys(departmentStats),
    datasets: [
      {
        data: Object.values(departmentStats),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for roles (Bar Chart)
  const roleChartData = {
    labels: Object.keys(roleStats),
    datasets: [
      {
        label: 'Number of Employees',
        data: Object.values(roleStats),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Employee Roles Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Department Distribution',
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  const filteredEmployees = selectedDepartment
    ? employees.filter(emp => emp.department === selectedDepartment)
    : employees;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.h1
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Dashboard
      </motion.h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Employees', value: employees.length, color: 'blue' },
          { title: 'Departments', value: Object.keys(departmentStats).length, color: 'green' },
          { title: 'Roles', value: Object.keys(roleStats).length, color: 'purple' }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-white rounded-lg shadow p-6 transform transition-all duration-200`}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h2>
            <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="h-[400px]">
            <Pie data={departmentChartData} options={pieOptions} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="h-[400px]">
            <Bar data={roleChartData} options={barOptions} />
          </div>
        </motion.div>
      </div>

      {/* Department Filter */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`px-4 py-2 rounded ${!selectedDepartment ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          {Object.keys(departmentStats).map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 py-2 rounded ${selectedDepartment === dept ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {dept}
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
                      key={employee._id}
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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </motion.div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
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
  );
};

export default Dashboard;
