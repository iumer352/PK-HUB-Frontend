import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    const navigate = useNavigate();

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

    const fetchJobStatus = async (jobId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
            const applicants = response.data;
            
            // If no applicants found, it will throw an error and go to catch block
            // Check if any applicant is hired
            const hasHiredApplicant = applicants.some(applicant => applicant.status === 'hired');
            if (hasHiredApplicant) {
                return 'completed';
            }
            
            // If there are applicants but none hired, status is interviewing
            return 'interviewing';
        } catch (err) {
            // If no applicants found
            if (err.response?.data?.message === 'No applicants found for this job') {
                return 'advertisement';
            }
            // For other errors, return a default status
            return 'advertisement';
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobs');
            const jobsData = response.data;
            
            // Fetch status for each job
            const jobsWithStatus = await Promise.all(
                jobsData.map(async (job) => {
                    const status = await fetchJobStatus(job.id);
                    return { ...job, currentStatus: status };
                })
            );
            
            setJobs(jobsWithStatus);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch jobs');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'advertisement':
                return 'bg-blue-100 text-blue-800';
            case 'interviewing':
                return 'bg-yellow-100 text-yellow-800';
            case 'offer':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                return 'bg-red-100 text-red-800';
            case 'High Priority':
                return 'bg-orange-100 text-orange-800';
            case 'Normal':
                return 'bg-blue-100 text-blue-800';
            case 'Low Priority':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filteredJobs = jobs.filter((job) => job.status !== 'Closed');

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Success Message Toast */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-out">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {successMessage}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Job Postings</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowInterviewerModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Add Interviewer
                    </button>
                    <button
                        onClick={() => setShowHiringManagerModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Add Hiring Manager
                    </button>
                    <button
                        onClick={handleCreateJob}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create New Job
                    </button>
                </div>
            </div>

            {/* Interviewer Modal */}
            {showInterviewerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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

            {/* Hiring Manager Modal */}
            {showHiringManagerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Hiring Manager</h2>
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

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiring Manager</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Age (Days)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredJobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleJobClick(job.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{job.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {job.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {job.functionType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{job.hiringManager}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(job.hiringUrgency)}`}>
                                            {job.hiringUrgency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.currentStatus)}`}>
                                            {job.currentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{formatDate(job.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {calculateJobAge(job.createdAt)} days
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
            </div>
        </div>
    );
};

export default ManageJobPostings;
