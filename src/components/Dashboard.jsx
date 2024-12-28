import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, Users, Briefcase, Calendar } from 'lucide-react';
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

  // Dashboard navigation options
  const dashboardOptions = [
    { name: 'Employee Management', path: '/employees' },
    { name: 'Recruitment Dashboard', path: '/manage' },
    { name: 'Project Dashboard', path: '/projectDashboard' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API endpoints
        const [projectsRes, jobsRes, interviewsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/projects/stats'),
          axios.get('http://localhost:5000/api/jobs/stats'),
          axios.get('http://localhost:5000/api/interviews/stats')
        ]);

        setDashboardData({
          projectStats: projectsRes.data,
          jobStats: jobsRes.data,
          interviewStats: interviewsRes.data
        });
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
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart configurations
  const projectProgressData = {
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
  };

  const jobsByDepartmentData = {
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
  };

  const projectStatusData = {
    labels: ['Active', 'Completed', 'Upcoming'],
    datasets: [
      {
        data: [
          dashboardData.projectStats.active,
          dashboardData.projectStats.completed,
          dashboardData.projectStats.upcoming
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
      }
    ]
  };

  const recruitmentMetricsData = {
    labels: ['Job Openings', 'Interview Success', 'Hiring Speed', 'Candidate Quality', 'Offer Acceptance'],
    datasets: [
      {
        label: 'Current Period',
        data: [90, 85, 75, 80, 88],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }
    ]
  };

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
    <div className="p-6">
      {/* Dashboard Navigation */}
      <div className="mb-6 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-gray-700">Select Dashboard</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              {dashboardOptions.map((option) => (
                <button
                  key={option.path}
                  onClick={() => {
                    navigate(option.path);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total Projects',
              value: dashboardData.projectStats.total,
              icon: Briefcase,
              color: 'blue',
              trend: '+12%'
            },
            {
              title: 'Open Positions',
              value: dashboardData.jobStats.open,
              icon: Users,
              color: 'green',
              trend: '+5%'
            },
            {
              title: 'Upcoming Interviews',
              value: dashboardData.interviewStats.upcoming,
              icon: Calendar,
              color: 'yellow',
              trend: '+8%'
            },
            {
              title: 'Hiring Rate',
              value: '85%',
              icon: TrendingUp,
              color: 'purple',
              trend: '+3%'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500 text-sm font-semibold">{stat.trend}</span>
                <span className="text-gray-500 text-sm ml-2">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Progress Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
            <div className="h-[300px]">
              <Line
                data={projectProgressData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Jobs by Department Doughnut Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Jobs by Department</h3>
            <div className="h-[300px]">
              <Doughnut
                data={jobsByDepartmentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right' }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Project Status Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Project Status Overview</h3>
            <div className="h-[300px]">
              <Bar
                data={projectStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Recruitment Metrics Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Recruitment Metrics</h3>
            <div className="h-[300px]">
              <Radar
                data={recruitmentMetricsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
