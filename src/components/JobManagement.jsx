import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageJobPostings = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobs');
            console.log(response.data);
            setJobs(response.data);
        } catch (err) {
            setError('Failed to fetch jobs');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewJobClick = () => {
        navigate('/jobposting');
    };

    const handleEditJob = (jobId) => {
        console.log('Edit job', jobId);
        navigate(`/joblisting/${jobId}`);
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
                fetchJobs(); // Refresh the jobs list
            } catch (err) {
                setError('Failed to delete job');
                console.error('Error:', err);
            }
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || job.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Navigate to job listing details
    const handleJobClick = (jobId) => {
        navigate(`/joblisting/${jobId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Job Postings</h1>
                        <p className="text-gray-600 mt-1">View and manage all your job listings</p>
                    </div>
                    <button className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={handleNewJobClick}>
                        + New Job Posting
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Job Title</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Company</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Location</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Applicants</th>
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
                                        <td className="px-6 py-4 text-gray-600">{job.company}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {job.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{job.location}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${job.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                                                ${job.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${job.status === 'Closed' ? 'bg-gray-100 text-gray-800' : ''}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{job.applicants}</td>
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

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No job postings found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageJobPostings;
