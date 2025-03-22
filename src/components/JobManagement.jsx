import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageJobPostings = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHiringManagerModal, setShowHiringManagerModal] = useState(false);
    const [showInterviewerModal, setShowInterviewerModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [hiringManagerForm, setHiringManagerForm] = useState({
        name: '',
        email: ''
    });
    const [interviewerForm, setInterviewerForm] = useState({
        name: '',
        email: '',
        position: '',
        interview_type: 'Technical',
        function: 'Data Transformation'
    });
    const [hiringManagerError, setHiringManagerError] = useState(null);
    const [interviewerError, setInterviewerError] = useState(null);
    const [selectedFunction, setSelectedFunction] = useState(() => 
        localStorage.getItem('jobFilter_function') || ''
    );
    const [selectedUrgency, setSelectedUrgency] = useState(() => 
        localStorage.getItem('jobFilter_urgency') || ''
    );
    const [demandedForFilter, setDemandedForFilter] = useState(() => 
        localStorage.getItem('jobFilter_demandedFor') || 'all'
    );
    const [statusFilter, setStatusFilter] = useState(() => 
        localStorage.getItem('jobFilter_status') || 'active'
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(10); // Number of jobs per page
    const navigate = useNavigate();

    // Add this to get user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';
    const isHR = user.role === 'hr';

    // Add new states for modals
    const [showAddInterviewerModal, setShowAddInterviewerModal] = useState(false);
    const [showAddSolutionLeadModal, setShowAddSolutionLeadModal] = useState(false);

    // Add this to your state declarations at the top
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Add useEffect to save filter states to localStorage when they change
    useEffect(() => {
        localStorage.setItem('jobFilter_function', selectedFunction);
        localStorage.setItem('jobFilter_urgency', selectedUrgency);
        localStorage.setItem('jobFilter_demandedFor', demandedForFilter);
        localStorage.setItem('jobFilter_status', statusFilter);
    }, [selectedFunction, selectedUrgency, demandedForFilter, statusFilter]);

    const getStatusColor = (jobStatus) => {
        switch (jobStatus?.toLowerCase()) {
            case 'advertisement':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'in hr round':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'in cultural round':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'in technical round':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'in final round':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'completed':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
            default:
                return 'bg-gray-50 text-gray-600 border border-gray-200';
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobs');
            const jobsData = response.data;
            console.log('Jobs with jobStatus:', jobsData); // Debug log
            setJobs(jobsData);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch jobs');
            setLoading(false);
        }
    };

    const handleHiringManagerSubmit = async (e) => {
        e.preventDefault();
        setHiringManagerError(null);
        
        try {
            await axios.post('http://localhost:5000/api/hiring-managers', hiringManagerForm);
            setShowHiringManagerModal(false);
            setHiringManagerForm({ name: '', email: '' });
            setSuccessMessage('Hiring Manager added successfully!');
        } catch (err) {
            setHiringManagerError(err.response?.data?.message || 'Failed to create hiring manager');
        }
    };

    const handleHiringManagerInputChange = (e) => {
        const { name, value } = e.target;
        setHiringManagerForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInterviewerSubmit = async (e) => {
        e.preventDefault();
        setInterviewerError(null);
        
        try {
            await axios.post('http://localhost:5000/api/interviewers', interviewerForm);
            setShowInterviewerModal(false);
            setInterviewerForm({
                name: '',
                email: '',
                position: '',
                interview_type: 'Technical',
                function: 'Data Transformation'
            });
            setSuccessMessage('Interviewer added successfully!');
        } catch (err) {
            setInterviewerError(err.response?.data?.message || 'Failed to create interviewer');
        }
    };

    const handleInterviewerInputChange = (e) => {
        const { name, value } = e.target;
        setInterviewerForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Urgent - Immediate Hire':
                return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
            case 'High Priority':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
            case 'Normal':
                return 'bg-gray-50 text-gray-600 border border-gray-200';
            case 'Low Priority':
                return 'bg-gray-50 text-gray-600 border border-gray-200';
            default:
                return 'bg-gray-50 text-gray-600 border border-gray-200';
        }
    };

    const calculateJobAge = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleCreateJob = () => {
        navigate('/jobposting');
    };

    const handleEditJob = (jobId) => {
        navigate(`/edit-job/${jobId}`);
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
                fetchJobs();
            } catch (err) {
                setError('Failed to delete job');
            }
        }
    };

    const handleJobClick = (jobId) => {
        navigate(`/joblisting/${jobId}`);
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const getUniqueDemandedFor = () => {
        const uniqueValues = [...new Set(jobs.map(job => job.demandedFor))].filter(Boolean);
        return uniqueValues;
    };

    // Add handlers
    const handleAddInterviewer = async (formData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/interviewers', formData);
            // Handle success
            setShowAddInterviewerModal(false);
        } catch (error) {
            console.error('Error adding interviewer:', error);
        }
    };

    const handleAddSolutionLead = async (formData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/solution-leads', formData);
            // Handle success
            setShowAddSolutionLeadModal(false);
        } catch (error) {
            console.error('Error adding solution lead:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Modify the filteredJobs const to include the search filter
    const filteredJobs = jobs
        .filter(job => {
            // First filter by search query
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            // Then apply existing filters
            if (statusFilter === 'active' && job.status === 'Closed') {
                return false;
            }
            if (statusFilter === 'closed' && job.status !== 'Closed') {
                return false;
            }
            
            const functionMatch = !selectedFunction || job.functionType === selectedFunction;
            const urgencyMatch = !selectedUrgency || job.hiringUrgency === selectedUrgency;
            const demandedForMatch = demandedForFilter === 'all' || job.demandedFor === demandedForFilter;
            return functionMatch && urgencyMatch && demandedForMatch;
        })
        .sort((a, b) => {
            // Always sort closed jobs to the bottom regardless of filter
            if (a.status === 'Closed' && b.status !== 'Closed') return 1;
            if (a.status !== 'Closed' && b.status === 'Closed') return -1;
            return 0;
        });

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const Pagination = () => {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 
                   px-3 lg:px-2 py-2 lg:py-1.5">
                <div className="flex items-center justify-between px-4 lg:px-3 py-3 lg:py-2 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm lg:text-xs text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstJob + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(indexOfLastJob, filteredJobs.length)}
                                </span>{' '}
                                of <span className="font-medium">{filteredJobs.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md 
                                             px-2 lg:px-1.5 py-2 lg:py-1.5 text-gray-400 
                                             ring-1 ring-inset ring-gray-300 hover:bg-gray-50 
                                             focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 lg:h-4 w-5 lg:w-4" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`relative inline-flex items-center 
                                                 px-4 lg:px-3 py-2 lg:py-1.5 
                                                 text-sm lg:text-xs font-semibold ${
                                                   currentPage === idx + 1
                                                     ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                     : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                 }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md 
                                             px-2 lg:px-1.5 py-2 lg:py-1.5 text-gray-400 
                                             ring-1 ring-inset ring-gray-300 hover:bg-gray-50 
                                             focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 lg:h-4 w-5 lg:w-4" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Update your filter change handlers
    const handleFunctionChange = (e) => {
        setSelectedFunction(e.target.value);
    };

    const handleUrgencyChange = (e) => {
        setSelectedUrgency(e.target.value);
    };

    const handleDemandedForChange = (e) => {
        setDemandedForFilter(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    return (
        <>
            {/* Modals - Move these to the top level */}
            {/* Hiring Manager Modal */}
            {showHiringManagerModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Solution Lead</h2>
                            <button
                                onClick={() => setShowHiringManagerModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        
                        {hiringManagerError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                {hiringManagerError}
                            </div>
                        )}

                        <form onSubmit={handleHiringManagerSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={hiringManagerForm.name}
                                    onChange={handleHiringManagerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={hiringManagerForm.email}
                                    onChange={handleHiringManagerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowHiringManagerModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Interviewer Modal */}
            {showInterviewerModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Interviewer</h2>
                            <button
                                onClick={() => setShowInterviewerModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        
                        {interviewerError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                {interviewerError}
                            </div>
                        )}

                        <form onSubmit={handleInterviewerSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={interviewerForm.name}
                                    onChange={handleInterviewerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={interviewerForm.email}
                                    onChange={handleInterviewerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Position
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    value={interviewerForm.position}
                                    onChange={handleInterviewerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Interview Type
                                </label>
                                <select
                                    name="interview_type"
                                    value={interviewerForm.interview_type}
                                    onChange={handleInterviewerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="HR">HR</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Final">Final</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Function
                                </label>
                                <select
                                    name="function"
                                    value={interviewerForm.function}
                                    onChange={handleInterviewerInputChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="Data Transformation">Data Transformation</option>
                                    <option value="Analytics and AI">Analytics and AI</option>
                                    <option value="Low Code">Low Code</option>
                                    <option value="Digital Enablement">Digital Enablement</option>
                                    <option value="Innovation and Emerging Tech">Innovation and Emerging Tech</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInterviewerModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add Interviewer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Message */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
                        role="alert"
                    >
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="min-h-screen bg-gray-50 
                            py-2 lg:py-3 xl:py-4 2xl:py-5 
                            px-2 lg:px-4 xl:px-6 2xl:px-8">
                <div className="max-w-8xl mx-auto space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-5">
                    {/* Header Section */}
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg 
                                    p-2 lg:p-3 xl:p-5 2xl:p-6">
                        <h1 className="text-base lg:text-2xl xl:text-2xl 2xl:text-3xl font-bold text-gray-700">
                            Manage Job Postings
                        </h1>
                        <div className="flex gap-2 lg:gap-2 xl:gap-4 2xl:gap-5">
                            {(isAdmin || isHR) && (
                                <>
                                    <button 
                                        onClick={() => setShowInterviewerModal(true)}
                                        className="px-2 lg:px-3 xl:px-4 2xl:px-5 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-sm xl:text-base 2xl:text-lg 
                                                 text-indigo-600 bg-indigo-50 border border-indigo-200 
                                                 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        Add Interviewer
                                    </button>
                                    <button 
                                        onClick={() => setShowHiringManagerModal(true)}
                                        className="px-2 lg:px-3 xl:px-4 2xl:px-5 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-sm xl:text-base 2xl:text-lg 
                                                 text-indigo-600 bg-indigo-50 border border-indigo-200 
                                                 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        Add Solution Lead
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => navigate('/jobposting')}
                                className="px-2 lg:px-3 xl:px-4 2xl:px-5 
                                         py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                         text-xs lg:text-sm xl:text-base 2xl:text-lg 
                                         bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                                         transition-colors"
                            >
                                Create New Job
                            </button>
                        </div>
                    </div>

                    {/* Add Search Bar */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <input
                            type="text"
                            placeholder="Search jobs by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                     focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Filter section - bigger for xl and 2xl */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                                    gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-4 
                                    p-1.5 lg:p-2 xl:p-3 2xl:p-4 
                                    bg-gray-50 rounded-lg shadow-sm 
                                    mb-2 lg:mb-3">
                        <div className="space-y-0.5 xl:space-y-1 2xl:space-y-2">
                            <label className="block text-[11px] lg:text-xs xl:text-sm 2xl:text-base font-medium text-gray-700">
                                Filter by Function
                            </label>
                            <select
                                value={selectedFunction}
                                onChange={handleFunctionChange}
                                className="w-full rounded-md border border-gray-300 bg-white/90 
                                         px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 
                                         py-0.5 lg:py-1 xl:py-1.5 2xl:py-2
                                         text-[11px] lg:text-xs xl:text-sm 2xl:text-base text-gray-800"
                            >
                                <option value="">All Functions</option>
                                <option value="Data Transformation">Data Transformation</option>
                                <option value="Analytics and AI">Analytics and AI</option>
                                <option value="Low Code">Low Code</option>
                                <option value="Digital Enablement">Digital Enablement</option>
                                <option value="Innovation and Emerging Tech">Innovation and Emerging Tech</option>
                            </select>
                        </div>
                        <div className="space-y-0.5 xl:space-y-1 2xl:space-y-2">
                            <label className="block text-[11px] lg:text-xs xl:text-sm 2xl:text-base font-medium text-gray-700">
                                Filter by Urgency
                            </label>
                            <select
                                value={selectedUrgency}
                                onChange={handleUrgencyChange}
                                className="w-full rounded-md border border-gray-300 bg-white/90 
                                         px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 
                                         py-0.5 lg:py-1 xl:py-1.5 2xl:py-2
                                         text-[11px] lg:text-xs xl:text-sm 2xl:text-base text-gray-800"
                            >
                                <option value="">All Urgencies</option>
                                <option value="Urgent - Immediate Hire">Urgent - Immediate Hire</option>
                                <option value="High Priority">High Priority</option>
                                <option value="Normal">Normal</option>
                                <option value="Low Priority">Low Priority</option>
                            </select>
                        </div>
                        <div className="space-y-0.5 xl:space-y-1 2xl:space-y-2">
                            <label className="block text-[11px] lg:text-xs xl:text-sm 2xl:text-base font-medium text-gray-700">
                                Filter by Client/Solution
                            </label>
                            <select
                                value={demandedForFilter}
                                onChange={handleDemandedForChange}
                                className="w-full rounded-md border border-gray-300 bg-white/90 
                                         px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 
                                         py-0.5 lg:py-1 xl:py-1.5 2xl:py-2
                                         text-[11px] lg:text-xs xl:text-sm 2xl:text-base text-gray-800"
                            >
                                <option value="all">All Demands</option>
                                {getUniqueDemandedFor().map(value => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-0.5 xl:space-y-1 2xl:space-y-2">
                            <label className="block text-[11px] lg:text-xs xl:text-sm 2xl:text-base font-medium text-gray-700">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="w-full rounded-md border border-gray-300 bg-white/90 
                                         px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 
                                         py-0.5 lg:py-1 xl:py-1.5 2xl:py-2
                                         text-[11px] lg:text-xs xl:text-sm 2xl:text-base text-gray-800"
                            >
                                <option value="active">Active Jobs</option>
                                <option value="closed">Closed Jobs</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Table section - consistent text sizes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Grade</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Solution</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Solution Lead</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Urgency</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Posted Date</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Demanded for</th>
                                    <th className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 
                                                 text-left text-[11px] lg:text-xs xl:text-sm 2xl:text-base 
                                                 font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentJobs.map((job) => (
                                    <tr
                                        key={job.id}
                                        className={`cursor-pointer ${
                                            job.status === 'Closed' 
                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleJobClick(job.id)}
                                    >
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                                            <div className="flex items-center">
                                                <div className={`text-[11px] lg:text-xs xl:text-base 2xl:text-lg font-medium ${
                                                    job.status === 'Closed' ? 'text-gray-600' : 'text-gray-900'
                                                }`}>
                                                    {job.title}
                                                </div>
                                                {job.status === 'Closed' && (
                                                    <span className="ml-1.5 px-2 lg:px-2.5 py-1 lg:py-1.5 
                                                                   text-[11px] lg:text-xs xl:text-lg 2xl:text-base 
                                                                   leading-4 font-semibold rounded-full 
                                                                   bg-gray-600 text-white">
                                                        Closed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                                            <span className={`inline-flex items-center 
                                                                  px-2 lg:px-2.5 py-1 lg:py-1.5 
                                                                  rounded-full text-[11px] lg:text-xs xl:text-xs 2xl:text-base 
                                                                  font-medium ${
                                                                    job.status === 'Closed'
                                                                      ? 'bg-gray-300 text-gray-700'
                                                                      : 'bg-blue-100 text-blue-800'
                                                                  }`}>
                                                {job.grade}
                                            </span>
                                        </td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                                            <span className={`inline-flex items-center 
                                                                  px-2 lg:px-2.5 py-1 lg:py-1.5 
                                                                  rounded-full text-[11px] lg:text-xs xl:text-xs 2xl:text-base 
                                                                  font-medium ${
                                                                    job.status === 'Closed'
                                                                      ? 'bg-gray-300 text-gray-700'
                                                                      : 'bg-purple-100 text-purple-800'
                                                                  }`}>
                                                {job.functionType}
                                            </span>
                                        </td>
                                        <td className={`px-2 lg:px-2.5 xl:px-3 2xl:px-4 ${job.status === 'Closed' ? 'text-gray-500' : 'text-gray-600'}`}>
                                            {job.hiringManager}
                                        </td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-4">
                                            <span className={`inline-flex items-center 
                                                                  px-2 lg:px-2.5 py-1 lg:py-1.5 
                                                                  rounded-full text-[11px] lg:text-xs xl:text-xs 2xl:text-sm
                                                                  font-medium ${
                                                                    job.status === 'Closed'
                                                                      ? 'bg-gray-300 text-gray-700'
                                                                      : getUrgencyColor(job.hiringUrgency)
                                                                  }`}>
                                                {job.hiringUrgency}
                                            </span>
                                        </td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                                            <span className={`inline-flex items-center 
                                                                  px-2 lg:px-2.5 py-1 lg:py-1.5 
                                                                  rounded-full text-[11px] lg:text-xs xl:text-xs 2xl:text-sm 
                                                                  font-medium ${getStatusColor(job.jobStatus)}`}>
                                                {job.jobStatus || 'Advertisement'}
                                            </span>
                                        </td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 text-sm text-gray-600">{formatDate(job.createdAt)}</td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                                            <span className="inline-flex items-center 
                                                       px-2 lg:px-2.5 py-1 lg:py-1.5 
                                                       rounded-full text-[11px] lg:text-xs xl:text-xs 2xl:text-base 
                                                       bg-gray-100 text-gray-800">
                                                {job.demandedFor} 
                                            </span>
                                        </td>
                                        <td className="px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                                     py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                                            <div className="flex space-x-2">
                                                <button className="text-[10px] lg:text-sm xl:text-base 2xl:text-lg text-blue-600 hover:text-blue-800" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditJob(job.id);
                                                }}>Edit</button>
                                                <button className="text-[10px] lg:text-sm xl:text-base 2xl:text-lg text-red-600 hover:text-red-800" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteJob(job.id);
                                                }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 
                                   px-2 lg:px-2.5 xl:px-3 2xl:px-4 
                                   py-1.5 lg:py-2 xl:py-2.5 2xl:py-3">
                        <Pagination />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManageJobPostings;