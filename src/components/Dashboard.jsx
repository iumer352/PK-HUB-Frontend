import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, Users, Briefcase, Calendar, CheckSquare } from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showPositionsModal, setShowPositionsModal] = useState(false);
  const [showHiringModal, setShowHiringModal] = useState(false);
  const [onboardedEmployees, setOnboardedEmployees] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    projectStats: {
      total: 0,
      active: 0,
      completed: 0,
      upcoming: 0,
      monthlyProgress: []
    },
    jobStats: {
      total: 0,
      open: 0,
      filled: 0,
      inProgress: 0,
      byDepartment: {}
    },
    interviewStats: {
      scheduled: 0,
      completed: 0,
      upcoming: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsData, setJobsData] = useState([]);

  // Add recruitment metrics state
  const [recruitmentMetrics, setRecruitmentMetrics] = useState({
    byGrade: {
      'Analyst': 12,
      'Associate': 15,
      'Senior': 8,
      'Manager': 5
    },
    byFunction: {
      'Technology': 18,
      'Analytics': 12,
      'Consulting': 10,
      'Digital': 8
    },
    byDemandedFor: {
      'Client A': 10,
      'Client B': 8,
      'Internal': 15,
      'Solution X': 7
    },
    byUrgency: {
      'Urgent': 8,
      'High': 12,
      'Normal': 15,
      'Low': 5
    }
  });

  // Update dashboard navigation options
  const dashboardOptions = [
    { name: 'Recruitment Management', path: '/manage' },
    { name: 'Resource Management', path: '/employees' }
  ];

  // Function to process jobs data into required format
  const processJobsData = (jobs) => {
    // Count by function type
    const byFunction = jobs.reduce((acc, job) => {
      acc[job.functionType] = (acc[job.functionType] || 0) + 1;
      return acc;
    }, {});

    // Count by grade
    const byGrade = jobs.reduce((acc, job) => {
      acc[job.grade] = (acc[job.grade] || 0) + 1;
      return acc;
    }, {});

    // Count by demanded for (clients/projects)
    const byDemandedFor = jobs.reduce((acc, job) => {
      acc[job.demandedFor] = (acc[job.demandedFor] || 0) + 1;
      return acc;
    }, {});

    // Count by urgency
    const byUrgency = jobs.reduce((acc, job) => {
      acc[job.hiringUrgency] = (acc[job.hiringUrgency] || 0) + 1;
      return acc;
    }, {});

    // Count by status
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPositions: jobs.length,
      openPositions: statusCounts['Active'] || 0,
      inProgress: jobs.filter(job => job.status === 'In Progress').length,
      filled: jobs.filter(job => job.status === 'Filled').length,
      byFunction,
      byGrade,
      byDemandedFor,
      byUrgency
    };
  };

  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const processedData = processJobsData(response.data);
        setJobsData(processedData);
      } catch (err) {
        console.error('Error fetching jobs data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API endpoints
        const [projectsRes, jobsRes, interviewsRes, employeesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/employees')
        ]);
      
        setOnboardedEmployees(employeesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use dummy data for demonstration
        setDashboardData({
          projectStats: {
            total: 25,
            active: 12,
            completed: 8,
            upcoming: 5,
            monthlyProgress: [
              { month: 'Jan', count: 5 },
              { month: 'Feb', count: 8 },
              { month: 'Mar', count: 12 },
              { month: 'Apr', count: 15 },
              { month: 'May', count: 10 },
              { month: 'Jun', count: 18 }
            ]
          },
          jobStats: {
            total: 45,
            open: 15,
            filled: 20,
            inProgress: 10,
            byDepartment: {
              Engineering: 20,
              Marketing: 8,
              Sales: 7,
              Design: 5,
              HR: 5
            }
          },
          interviewStats: {
            scheduled: 12,
            completed: 25,
            upcoming: 8
          }
        });
        setOnboardedEmployees([
          { _id: 1, name: 'John Doe', role: 'Software Engineer', joiningDate: '2022-01-01' },
          { _id: 2, name: 'Jane Doe', role: 'Marketing Manager', joiningDate: '2022-02-01' },
          { _id: 3, name: 'Bob Smith', role: 'Sales Representative', joiningDate: '2022-03-01' },
          { _id: 4, name: 'Alice Johnson', role: 'Design Lead', joiningDate: '2022-04-01' },
          { _id: 5, name: 'Mike Brown', role: 'HR Generalist', joiningDate: '2022-05-01' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatModal = ({ show, onClose, title, children }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ProjectsModal = () => (
    <StatModal
      show={showProjectsModal}
      onClose={() => setShowProjectsModal(false)}
      title="Project Statistics"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Active Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.projectStats.active}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Completed Projects</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData.projectStats.completed}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Upcoming Projects</h3>
            <p className="text-3xl font-bold text-yellow-600">{dashboardData.projectStats.upcoming}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
          <Line
            data={{
              labels: dashboardData.projectStats.monthlyProgress.map(item => item.month),
              datasets: [
                {
                  label: 'Project Progress',
                  data: dashboardData.projectStats.monthlyProgress.map(item => item.count),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.4,
                  fill: true,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { 
                legend: { position: 'top' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 5
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </StatModal>
  );

  const PositionsModal = () => (
    <StatModal
      show={showPositionsModal}
      onClose={() => setShowPositionsModal(false)}
      title="Open Positions"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Open Positions</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData.jobStats.open}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Filled Positions</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.jobStats.filled}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">In Progress</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardData.jobStats.inProgress}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Positions by Department</h3>
          <Doughnut
            data={{
              labels: Object.keys(dashboardData.jobStats.byDepartment),
              datasets: [
                {
                  label: 'Jobs by Department',
                  data: Object.values(dashboardData.jobStats.byDepartment),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                  ],
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { 
                legend: { position: 'right' }
              }
            }}
          />
        </div>
      </div>
    </StatModal>
  );

  const HiringModal = () => (
    <StatModal
      show={showHiringModal}
      onClose={() => setShowHiringModal(false)}
      title="Hiring Rate Statistics"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Overall Hiring Rate</h3>
            <p className="text-3xl font-bold text-purple-600">85%</p>
            <p className="text-sm text-purple-600 mt-2">+3% vs last month</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Average Time to Hire</h3>
            <p className="text-3xl font-bold text-blue-600">21 days</p>
            <p className="text-sm text-blue-600 mt-2">-2 days vs last month</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Hiring Metrics</h3>
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Hiring Rate',
                data: [75, 78, 80, 82, 83, 85],
                backgroundColor: 'rgba(147, 51, 234, 0.5)',
                borderColor: 'rgb(147, 51, 234)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { 
                legend: { position: 'top' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    stepSize: 20
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </StatModal>
  );

  const OnboardingModal = () => (
    <AnimatePresence>
      {showOnboardingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowOnboardingModal(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Newly Onboarded Employees</h2>
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {onboardedEmployees.map((employee) => (
                <div key={employee._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{employee.name}</h3>
                      <p className="text-gray-600">{employee.role}</p>
                      <p className="text-gray-500 text-sm">{employee.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Joined: {new Date(employee.joiningDate).toLocaleDateString()}</p>
                      <button
                        onClick={() => navigate(`/onboarding/${employee._id}`)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
          className="h-16 w-16 border-4 border-blue-500 rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Selection Dropdown */}
        <div className="relative mb-8">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full md:w-72 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 text-left"
          >
            <span className="text-gray-700 font-medium">Select Dashboard</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full md:w-72 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
              >
                {dashboardOptions.map((option) => (
                  <button
                    key={option.path}
                    onClick={() => {
                      navigate(option.path);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {option.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100"
              onClick={() => setShowProjectsModal(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg transform transition-transform duration-300 hover:rotate-12">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {jobsData.totalPositions || 0}
              </h3>
              <p className="text-gray-600 text-base">Total Positions</p>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100"
              onClick={() => setShowPositionsModal(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg transform transition-transform duration-300 hover:rotate-12">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {jobsData.openPositions}
              </h3>
              <p className="text-gray-600 text-base">Open Positions</p>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+5%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100"
              onClick={() => setShowHiringModal(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg transform transition-transform duration-300 hover:rotate-12">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">85%</h3>
              <p className="text-gray-600 text-base">Hiring Rate</p>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+3%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </motion.div>

            {/* Onboarding Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100"
              onClick={() => setShowOnboardingModal(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg transform transition-transform duration-300 hover:rotate-12">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {onboardedEmployees.length}
              </h3>
              <p className="text-gray-600 text-base">Newly Onboarded</p>
            </motion.div>
          </div>
          
          {/* Recruitment Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Jobs by Grade */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg h-[400px] transition-all duration-300 hover:shadow-xl border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Grade</h3>
              <Bar
                data={{
                  labels: Object.keys(jobsData.byGrade),
                  datasets: [{
                    label: 'Number of Positions',
                    data: Object.values(jobsData.byGrade),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 }
                    }
                  }
                }}
              />
            </motion.div>

            {/* Jobs by Function */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg h-[400px] transition-all duration-300 hover:shadow-xl border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Function</h3>
              <Doughnut
                data={{
                  labels: Object.keys(jobsData.byFunction),
                  datasets: [{
                    data: Object.values(jobsData.byFunction),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(147, 51, 234, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(249, 115, 22, 0.8)',
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { padding: 20 }
                    }
                  }
                }}
              />
            </motion.div>

            {/* Jobs by Demanded For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg h-[400px] transition-all duration-300 hover:shadow-xl border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Demanded For</h3>
              <Bar
                data={{
                  labels: Object.keys(jobsData.byDemandedFor),
                  datasets: [{
                    label: 'Number of Positions',
                    data: Object.values(jobsData.byDemandedFor),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 }
                    }
                  }
                }}
              />
            </motion.div>

            {/* Jobs by Urgency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg h-[400px] transition-all duration-300 hover:shadow-xl border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Urgency</h3>
              <Doughnut
                data={{
                  labels: Object.keys(jobsData.byUrgency),
                  datasets: [{
                    data: Object.values(jobsData.byUrgency),
                    backgroundColor: [
                      'rgba(239, 68, 68, 0.8)',   // Red for Urgent
                      'rgba(249, 115, 22, 0.8)',  // Orange for High
                      'rgba(59, 130, 246, 0.8)',  // Blue for Normal
                      'rgba(16, 185, 129, 0.8)',  // Green for Low
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { padding: 20 }
                    }
                  }
                }}
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Modals */}
        <ProjectsModal />
        <PositionsModal />
        <OnboardingModal />
        <HiringModal />
      </div>
    </div>
  );
};

export default Dashboard;
