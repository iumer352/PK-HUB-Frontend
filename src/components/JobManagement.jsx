import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    const [selectedFunction, setSelectedFunction] = useState('');
    const [selectedUrgency, setSelectedUrgency] = useState('');
    const [demandedForFilter, setDemandedForFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(10); // Number of jobs per page
    const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'closed', 'all'
    const navigate = useNavigate();

    // Add this to get user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

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
            const response = await axios.get('http://10.183.199.14:5000/api/jobs');
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
            await axios.post('http://10.183.199.14:5000/api/hiring-managers', hiringManagerForm);
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
            await axios.post('http://10.183.199.14:5000/api/interviewers', interviewerForm);
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
                await axios.delete(`http://10.183.199.14:5000/api/jobs/${jobId}`);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filteredJobs = jobs
        .filter(job => {
            // Filter by status
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
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
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
                        <p className="text-sm text-gray-700">
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
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx + 1}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
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
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-semibold text-gray-900">Manage Job Postings</h1>
                    <div className="flex gap-3">
                        {isAdmin && (
                            <>
                                <button className="px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                                    Add Interviewer
                                </button>
                                <button className="px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                                    Add Solution Lead
                                </button>
                            </>
                        )}
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Create New Job
                        </button>
                    </div>
                </div>

                {/* Filter section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Function
                            </label>
                            <select
                                value={selectedFunction}
                                onChange={(e) => setSelectedFunction(e.target.value)}
                                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                                         hover:border-indigo-300 transition-colors"
                            >
                                <option value="">All Functions</option>
                                <option value="Data Transformation">Data Transformation</option>
                                <option value="Analytics and AI">Analytics and AI</option>
                                <option value="Low Code">Low Code</option>
                                <option value="Digital Enablement">Digital Enablement</option>
                                <option value="Innovation and Emerging Tech">Innovation and Emerging Tech</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Urgency
                            </label>
                            <select
                                value={selectedUrgency}
                                onChange={(e) => setSelectedUrgency(e.target.value)}
                                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                                         hover:border-indigo-300 transition-colors"
                            >
                                <option value="">All Urgencies</option>
                                <option value="Urgent - Immediate Hire">Urgent - Immediate Hire</option>
                                <option value="High Priority">High Priority</option>
                                <option value="Normal">Normal</option>
                                <option value="Low Priority">Low Priority</option>
                            </select>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-700">Filter by Client/Solution:</span>
                            <select
                                value={demandedForFilter}
                                onChange={(e) => setDemandedForFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                                         hover:border-indigo-300 transition-colors"
                            >
                                <option value="all">All Demands</option>
                                {getUniqueDemandedFor().map(value => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                                         hover:border-indigo-300 transition-colors"
                            >
                                <option value="active">Active Jobs</option>
                                <option value="closed">Closed Jobs</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solution Lead</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demanded for</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentJobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className={`cursor-pointer ${
                                        job.status === 'Closed' 
                                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-600' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleJobClick(job.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`text-sm font-medium ${
                                                job.status === 'Closed' ? 'text-gray-600' : 'text-gray-900'
                                            }`}>
                                                {job.title}
                                            </div>
                                            {job.status === 'Closed' && (
                                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-white">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            job.status === 'Closed'
                                                ? 'bg-gray-300 text-gray-700'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {job.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            job.status === 'Closed'
                                                ? 'bg-gray-300 text-gray-700'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {job.functionType}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${job.status === 'Closed' ? 'text-gray-500' : 'text-gray-600'}`}>
                                        {job.hiringManager}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            job.status === 'Closed'
                                                ? 'bg-gray-300 text-gray-700'
                                                : getUrgencyColor(job.hiringUrgency)
                                        }`}>
                                            {job.hiringUrgency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            getStatusColor(job.jobStatus)
                                        }`}>
                                            {job.jobStatus || 'Advertisement'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{formatDate(job.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {job.demandedFor} 
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-800" onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditJob(job.id);
                                            }}>Edit</button>
                                            <button className="text-red-600 hover:text-red-800" onClick={(e) => {
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
                    <Pagination />
                </div>
            </div>
        </div>
    );
};

export default ManageJobPostings;