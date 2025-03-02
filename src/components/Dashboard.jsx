import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, Users, Briefcase, Calendar, CheckSquare, Clock, FileText } from 'lucide-react';
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
import ConfirmDialog from './ConfirmDialog';
import InterviewsModal from './modals/InterviewsModal';
import ProjectsModal from './modals/ProjectsModal';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState('all');

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

  // Update the state for newly onboarded employees
  const [newlyOnboarded, setNewlyOnboarded] = useState([]);

  // Add new states at the top of the component
  const [interviewerData, setInterviewerData] = useState(null);
  const [pendingInterviews, setPendingInterviews] = useState([]);
  const [showInterviewsModal, setShowInterviewsModal] = useState(false);

  // Add this state at the top with other states
  const [jobsBySolutionLead, setJobsBySolutionLead] = useState({});

  // Update dashboard navigation options
  const dashboardOptions = [
    { name: 'Recruitment Management', path: '/manage' },
    { name: 'Resource Management', path: '/employees' }
  ];

  const solutionLines = [
    'Data Transformation',
    'Analytics and AI',
    'Low Code',
    'Digital Enablement',
    'Innovation and Emerging Tech'
  ];

  // Add role check at the top of the component
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isInterviewer = user.role === 'interviewer';

  // Add this with other state declarations at the top
  const [showAllPositionsModal, setShowAllPositionsModal] = useState(false);

  // Function to process jobs data into required format
  const processJobsData = (jobs) => {
    // Filter jobs by selected solution if not 'all'
    const filteredJobs = selectedSolution === 'all' 
      ? jobs 
      : jobs.filter(job => job.functionType === selectedSolution);

    // Count by function type
    const byFunction = filteredJobs.reduce((acc, job) => {
      acc[job.functionType] = (acc[job.functionType] || 0) + 1;
      return acc;
    }, {});

    // Count by grade
    const byGrade = filteredJobs.reduce((acc, job) => {
      acc[job.grade] = (acc[job.grade] || 0) + 1;
      return acc;
    }, {});

    // Count by demanded for
    const byDemandedFor = filteredJobs.reduce((acc, job) => {
      acc[job.demandedFor] = (acc[job.demandedFor] || 0) + 1;
      return acc;
    }, {});

    // Count by hiring managers (solution leads)
    const bySolutionLead = jobs.reduce((acc, job) => {
      if (job.hiringManager) {
        acc[job.hiringManager] = (acc[job.hiringManager] || 0) + 1;
      }
      return acc;
    }, {});

    // Count by status
    const statusCounts = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPositions: filteredJobs.length,
      openPositions: statusCounts['Active'] || 0,
      inProgress: filteredJobs.filter(job => job.status === 'In Progress').length,
      filled: filteredJobs.filter(job => job.status === 'Filled').length,
      byFunction,
      byGrade,
      byDemandedFor,
      bySolutionLead
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
  }, [selectedSolution]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesResponse = await axios.get('http://localhost:5000/api/employees');
        const employees = employeesResponse.data;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);

        const recentEmployees = employees.filter(employee => {
          const joinDate = new Date(employee.joinDate);
          return joinDate > thirtyDaysAgo && 
            (selectedSolution === 'all' || employee.department === selectedSolution);
        });

        setNewlyOnboarded(recentEmployees);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [selectedSolution]);

  // Add new useEffect to fetch interviewer data
  useEffect(() => {
    const fetchInterviewerData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        const interviewersResponse = await axios.get(
          'http://localhost:5000/api/interviewers/',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Find the interviewer that matches the logged-in user's email
        const interviewer = interviewersResponse.data.find(
          int => int.email.toLowerCase() === user.email.toLowerCase()
        );

        if (interviewer) {
          setInterviewerData(interviewer);

          // Get pending interviews for this interviewer
          const interviewsResponse = await axios.get(
            `http://localhost:5000/api/interviewers/${interviewer.id}/pending-interviews`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          setPendingInterviews(interviewsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching interviewer data:', err);
      }
    };

    fetchInterviewerData();
  }, []);

  // Single useEffect to handle back button only for dashboard
  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      setShowConfirmDialog(true);
    };

    // Push initial state to prevent immediate back
    window.history.pushState({ page: 'dashboard' }, '', window.location.pathname);

    // Handle popstate (back button)
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []); // Empty dependency array since we only want this on mount

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

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

  const getUrgencyOrder = (urgency) => {
    const order = {
      'Urgent - Immediate Hire': 1,
      'High Priority': 2,
      'Normal': 3,
      'Low Priority': 4
    };
    return order[urgency] || 5;
  };

  const getStatusOrder = (status) => {
    const order = {
      'interviewing': 1,
      'Active': 2  // Active means advertisement
    };
    return order[status] || 3;
  };

  const ProjectsModal = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchJobs = async () => {
        if (!showProjectsModal) return;
        
        setLoading(true);
        try {
          const response = await axios.get('http://localhost:5000/api/jobs');
          // Filter only active jobs
          const activeJobs = response.data.filter(job => job.status === 'Active');
          setJobs(activeJobs);
        } catch (error) {
          console.error('Error fetching jobs:', error);
        }
        setLoading(false);
      };

      fetchJobs();
    }, [showProjectsModal]);

    return (
      <StatModal
        show={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        title="Open Positions"
      >
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 font-medium">Urgency:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.hiringUrgency === 'Urgent - Immediate Hire'
                              ? 'bg-red-100 text-red-800'
                              : job.hiringUrgency === 'High Priority'
                              ? 'bg-orange-100 text-orange-800'
                              : job.hiringUrgency === 'Normal'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {job.hiringUrgency}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 font-medium">Job Stage:</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Users className="w-3 h-3 mr-1" />
                            {job.jobStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/joblisting/${job.id}`);
                        setShowProjectsModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </StatModal>
    );
  };

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
                  label: 'Jobs by Solutions',
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
              {newlyOnboarded.map((employee) => (
                <div key={employee.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{employee.name}</h3>
                      <p className="text-gray-600">{employee.jobTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Joined: {new Date(employee.joinDate).toLocaleDateString()}</p>
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

  // Add AllPositionsModal component
  const AllPositionsModal = ({ show, onClose, jobsData }) => {
    // Data for the pie chart
    const chartData = {
      labels: ['Open Positions', 'Closed Positions'],
      datasets: [{
        data: [
          jobsData.openPositions || 0,
          (jobsData.totalPositions - jobsData.openPositions) || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green for open
          'rgba(107, 114, 128, 0.8)', // gray for closed
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 1
      }]
    };

    return (
      <StatModal
        show={show}
        onClose={onClose}
        title="Positions Overview"
      >
        <div className="p-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-green-600 mb-2">Open Positions</h4>
              <p className="text-3xl font-bold text-green-700">{jobsData.openPositions}</p>
              <p className="text-sm text-green-600 mt-2">Active job listings</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-4">
                <CheckSquare className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Closed Positions</h4>
              <p className="text-3xl font-bold text-gray-700">
                {jobsData.totalPositions - jobsData.openPositions}
              </p>
              <p className="text-sm text-gray-600 mt-2">Completed hirings</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">Position Status Distribution</h4>
            <div className="w-full max-w-md mx-auto h-[300px] flex items-center justify-center">
              <Doughnut 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: { size: 12 },
                        usePointStyle: true
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span>Total Positions:</span>
                <span className="font-medium">{jobsData.totalPositions}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Open Rate:</span>
                <span className="font-medium">
                  {((jobsData.openPositions / jobsData.totalPositions) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Closed Rate:</span>
                <span className="font-medium">
                  {(((jobsData.totalPositions - jobsData.openPositions) / jobsData.totalPositions) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </StatModal>
    );
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
    <>
      <div className="h-screen py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-full overflow-y-auto">

          {/* Dashboard Selection Dropdown */}
          <div className="relative mb-8">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full md:w-72 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 text-left"
            >
              <span className="text-gray-700 font-medium">
                {selectedSolution === 'all' ? 'All Solutions' : selectedSolution}
              </span>
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
                  <button
                    onClick={() => {
                      setSelectedSolution('all');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    All Solutions
                  </button>
                  {solutionLines.map((solution) => (
                    <button
                      key={solution}
                      onClick={() => {
                        setSelectedSolution(solution);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {solution}
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
            className="space-y-4"
          >
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Open Positions Card - First */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md 
                           transition-all duration-300 border border-gray-100"
                onClick={() => setShowProjectsModal(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  {jobsData.openPositions}
                </h3>
                <p className="text-gray-600">Open Positions</p>
              </motion.div>

              {/* All Positions Card - Second */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md 
                           transition-all duration-300 border border-gray-100"
                onClick={() => setShowAllPositionsModal(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {jobsData.totalPositions}
                  </h3>
                  <p className="text-gray-600">All Positions</p>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-green-600">
                      {jobsData.openPositions} Open
                    </span>
                    <span className="text-gray-500">
                      {jobsData.totalPositions - jobsData.openPositions} Closed
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Show Upcoming Interviews card only for interviewers */}
              {isInterviewer ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300 border border-gray-100"
                  onClick={() => setShowInterviewsModal(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg transform transition-transform duration-300 hover:rotate-12">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {pendingInterviews.length}
                  </h3>
                  <p className="text-gray-600 text-base">Upcoming Interviews</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-purple-600 font-medium">
                      {interviewerData?.interview_type} Interviewer
                    </span>
                  </div>
                </motion.div>
              ) : (
                // Show Hiring Rate card for non-interviewers
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
              )}

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
                  {newlyOnboarded.length}
                </h3>
                <p className="text-gray-600 text-base">Newly Onboarded</p>
              </motion.div>
            </div>
            
            {/* Recruitment Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    layout: {
                      padding: {
                        top: 20,
                        right: 20,
                        bottom: 0,
                        left: 10
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                      }
                    }
                  }}
                  style={{ maxHeight: '300px' }}
                />
              </motion.div>

              {/* Jobs by Function */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg h-[400px] transition-all duration-300 hover:shadow-xl border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Solutions</h3>
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
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Clients/Solutions</h3>
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

              {/* Jobs by Solution Leads */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg h-[400px] transition-all duration-300 hover:shadow-xl border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Jobs by Solution Leads</h3>
                <Doughnut
                  data={{
                    labels: Object.keys(jobsData.bySolutionLead),
                    datasets: [{
                      data: Object.values(jobsData.bySolutionLead),
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',    // Indigo
                        'rgba(147, 51, 234, 0.8)',    // Purple
                        'rgba(59, 130, 246, 0.8)',    // Blue
                        'rgba(16, 185, 129, 0.8)',    // Green
                        'rgba(249, 115, 22, 0.8)',    // Orange
                        'rgba(239, 68, 68, 0.8)',     // Red
                        'rgba(236, 72, 153, 0.8)',    // Pink
                      ]
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: { 
                          padding: 20,
                          boxWidth: 14,
                          font: {
                            size: 11
                          }
                        }
                      }
                    },
                    layout: {
                      padding: 20
                    },
                    width: 600,
                    height: 600
                  }}
                  style={{ maxWidth: '600px', maxHeight: '600px' }}
                />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Modals */}
          <ProjectsModal />
          <PositionsModal />
          <OnboardingModal />
          <HiringModal />
          <InterviewsModal
            show={showInterviewsModal}
            onClose={() => setShowInterviewsModal(false)}
            interviews={pendingInterviews}
          />
          <AllPositionsModal 
            show={showAllPositionsModal}
            onClose={() => setShowAllPositionsModal(false)}
            jobsData={jobsData}
          />
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          // Push state again to maintain the behavior
          window.history.pushState({ page: 'dashboard' }, '', window.location.pathname);
        }}
        onConfirm={() => {
          setShowConfirmDialog(false);
          handleSignOut();
        }}
      />
    </>
  );
};

export default Dashboard;
