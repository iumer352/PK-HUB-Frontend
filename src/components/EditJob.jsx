import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditJob = ({ jobId, onSuccess, isDropdown = false }) => {
    const navigate = useNavigate();
    const { jobId: urlJobId } = useParams();

    const [jobPosting, setJobPosting] = useState({
        title: '',
        grade: 'Analyst',
        hiringManager: '',
        hiringUrgency: 'Normal',
        roleOverview: '',
        keyResponsibilities: '',
        keySkillsAndCompetencies: '',
        status: 'Active',
        functionType: '',
        demandedFor: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [hiringManagers, setHiringManagers] = useState([]);

    const grades = [
        'Analyst',
        'Associate',
        'Senior Associate',
        'Consultant',
        'Senior Consultant',
        'Assistant Manager',
        'Manager',
        'Manager-1',
        'Senior Manager',
        'Associate Director',
        'Director'
    ];

    const urgencyLevels = [
        'Urgent - Immediate Hire',
        'High Priority',
        'Normal',
        'Low Priority'
    ];

    const functions = [
        'Digital Lighthouse',
        'Analytics and AI',
        'Data Transformation',
        'Low Code',
        'Digital Enablement',
        'Innovation and Emerging Tech'
    ];

    useEffect(() => {
        const fetchHiringManagers = async () => {
            try {
                const response = await axios.get('/api/hiring-managers');
                setHiringManagers(response.data);
            } catch (err) {
                console.error('Error fetching hiring managers:', err);
            }
        };

        fetchHiringManagers();
    }, []);

    useEffect(() => {
        if (urlJobId) {
            const fetchJobData = async () => {
                try {
                    const response = await axios.get(`/api/jobs/${urlJobId}`);
                    setJobPosting(response.data);
                } catch (err) {
                    console.error('Error:', err);
                    setError('Failed to fetch job details');
                }
            };
            fetchJobData();
        }
    }, [urlJobId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobPosting(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');  // Clear any existing success message

        try {
            const jobData = {
                ...jobPosting
            };

            console.log('Job posting is:', jobData);
            const response = await axios.put(`/api/jobs/${urlJobId}`, jobData);
            
            // Check if the response is successful
            if (response.status === 200) {
                setSuccessMessage('Job updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
                onSuccess();
            }
        } catch (err) {
            console.error('Error:', err);
            // Only set error if there's actually an error response
            if (err.response) {
                setError(err.response.data.message || 'Error saving job posting');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/manage');
    };

    return (
        <div className={`${isDropdown ? "" : "min-h-screen bg-gray-100"}`}>
            <div className={isDropdown ? "" : "mx-auto py-3 lg:py-4 xl:py-6 2xl:py-8 px-2 lg:px-3 xl:px-5 2xl:px-6 max-w-7xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"}>
                {/* Header section - smaller for lg */}
                {!isDropdown && (
                    <div className="mb-0 lg:mb-1 xl:mb-2 2xl:mb-3 flex justify-between items-center">
                        <div>
                            <h1 className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-gray-900">
                                Job Posting Details
                            </h1>
                            <p className="mt-1 text-xs lg:text-xs xl:text-sm 2xl:text-base text-gray-500">
                                View and update job details
                            </p>
                        </div>
                        <button
                            onClick={handleBack}
                            className="px-2 lg:px-3 xl:px-4 2xl:px-5 
                                     py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                     text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                     font-medium text-gray-600 bg-white rounded-md 
                                     shadow-sm hover:bg-gray-50"
                        >
                            Back to Jobs
                        </button>
                    </div>
                )}

                {/* Form Section */}
                <div className={`bg-white ${!isDropdown && "shadow-sm"} rounded-lg overflow-hidden`}>
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        {/* Messages */}
                        {successMessage && (
                            <div className="mb-2 lg:mb-3 xl:mb-4 2xl:mb-5 
                                          p-2 lg:p-3 xl:p-4 2xl:p-5 
                                          text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                          bg-green-100 text-green-700 rounded-lg">
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div className="mb-2 lg:mb-3 xl:mb-4 2xl:mb-5 
                                          p-2 lg:p-3 xl:p-4 2xl:p-5 
                                          text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                          bg-red-100 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Basic Info Section */}
                        <div className="p-3 lg:p-4 xl:p-6 2xl:p-7">
                            <h2 className="text-base lg:text-base xl:text-lg 2xl:text-xl 
                                         font-medium text-gray-900 
                                         mb-3 lg:mb-4 xl:mb-5 2xl:mb-6">
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                                          gap-2 lg:gap-3 xl:gap-4 2xl:gap-5">
                                <div>
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={jobPosting.title}
                                        onChange={handleInputChange}
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Grade Level
                                    </label>
                                    <select
                                        name="grade"
                                        value={jobPosting.grade}
                                        onChange={handleInputChange}
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {grades.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Solution Lead
                                    </label>
                                    <select
                                        name="hiringManager"
                                        value={jobPosting.hiringManager}
                                        onChange={handleInputChange}
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Select Solution Lead</option>
                                        {hiringManagers.map((manager) => (
                                            <option key={manager.id} value={manager.name}>{manager.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="lg:col-span-2 grid grid-cols-2 gap-2 lg:gap-3 xl:gap-4 2xl:gap-5">
                                    <div>
                                        <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                        font-medium text-gray-700 
                                                        mb-1 lg:mb-1 xl:mb-2">
                                            Function
                                        </label>
                                        <select
                                            name="functionType"
                                            value={jobPosting.functionType}
                                            onChange={handleInputChange}
                                            className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                     py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                     text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                     border border-gray-300 rounded-md shadow-sm 
                                                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">Select Function</option>
                                            {functions.map((func) => (
                                                <option key={func} value={func}>{func}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                        font-medium text-gray-700 
                                                        mb-1 lg:mb-1 xl:mb-2">
                                            Hiring Urgency
                                        </label>
                                        <select
                                            name="hiringUrgency"
                                            value={jobPosting.hiringUrgency}
                                            onChange={handleInputChange}
                                            className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                     py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                     text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                     border border-gray-300 rounded-md shadow-sm 
                                                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">Select Urgency</option>
                                            {urgencyLevels.map((level) => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Demanded For
                                    </label>
                                    <input
                                        type="text"
                                        name="demandedFor"
                                        value={jobPosting.demandedFor}
                                        onChange={handleInputChange}
                                        placeholder="Enter client/solution"
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Details Section */}
                        <div className="p-3 lg:p-4 xl:p-6 2xl:p-7">
                            <h2 className="text-base lg:text-base xl:text-lg 2xl:text-xl 
                                         font-medium text-gray-900 
                                         mb-3 lg:mb-4 xl:mb-5 2xl:mb-6">
                                Job Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3 xl:gap-4 2xl:gap-5">
                                <div>
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Role Overview
                                    </label>
                                    <textarea
                                        name="roleOverview"
                                        value={jobPosting.roleOverview}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Key Responsibilities
                                    </label>
                                    <textarea
                                        name="keyResponsibilities"
                                        value={jobPosting.keyResponsibilities}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                    font-medium text-gray-700 
                                                    mb-1 lg:mb-1 xl:mb-2">
                                        Key Skills and Competencies
                                    </label>
                                    <textarea
                                        name="keySkillsAndCompetencies"
                                        value={jobPosting.keySkillsAndCompetencies}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-2 lg:px-2 xl:px-3 2xl:px-4 
                                                 py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                                 text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                                 border border-gray-300 rounded-md shadow-sm 
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form actions */}
                        {!isDropdown && (
                            <div className="px-3 lg:px-4 xl:px-6 2xl:px-7 
                                          py-2 lg:py-3 xl:py-4 2xl:py-5 
                                          bg-gray-50 flex justify-end space-x-2 lg:space-x-3">
                                <button
                                    type="submit"
                                    className="px-2 lg:px-3 xl:px-4 2xl:px-5 
                                             py-1 lg:py-1.5 xl:py-2 2xl:py-2.5 
                                             text-xs lg:text-xs xl:text-sm 2xl:text-base 
                                             font-medium text-white bg-indigo-600 
                                             rounded-md shadow-sm 
                                             hover:bg-indigo-700 
                                             focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Update Job'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditJob; 