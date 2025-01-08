import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageJobPostings = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobs');
            setJobs(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch jobs');
            setLoading(false);
        }
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Job Postings</h1>
                <button
                    onClick={handleCreateJob}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create New Job
                </button>
            </div>

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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Job Title</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Grade</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Function</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Hiring Manager</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Urgency</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Posted Date</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleJobClick(job.id)}>
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${job.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                                            ${job.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${job.status === 'Closed' ? 'bg-gray-100 text-gray-800' : ''}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{formatDate(job.createdAt)}</td>
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
