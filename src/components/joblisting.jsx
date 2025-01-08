import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const JobPostingForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const { jobId } = useParams();

    const [jobPosting, setJobPosting] = useState({
        title: '',
        grade: 'Analyst',
        hiringManager: '',
        hiringUrgency: 'Normal',
        roleOverview: '',
        keyResponsibilities: '',
        keySkillsAndCompetencies: '',
        status: 'Active'
    });

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stageResults, setStageResults] = useState({});

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortConfig.direction === 'ascending' ? (
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const sortApplicants = (applicants) => {
        if (!sortConfig.key) return applicants;

        return [...applicants].sort((a, b) => {
            if (sortConfig.key === 'score') {
                const scoreA = JSON.parse(a.resume)?.score || 0;
                const scoreB = JSON.parse(b.resume)?.score || 0;
                return sortConfig.direction === 'ascending' ? scoreA - scoreB : scoreB - scoreA;
            }
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    // Get interview status for applicant
    const getApplicantStatus = (applicant) => {
        if (!applicant.interviews || applicant.interviews.length === 0) {
            return applicant.status === 'interviewing' ? 'HR Round' : applicant.status; // Show HR Round if interviewing
        }

        // Check if any interview has failed
        const hasFailedInterview = applicant.interviews.some(interview => 
            stageResults[interview.id]?.result === 'fail'
        );
        if (hasFailedInterview) {
            return 'Rejected';
        }

        // Check if all interviews are passed
        const allInterviewsPassed = applicant.interviews.every(interview => 
            stageResults[interview.id]?.result === 'pass'
        );
        if (allInterviewsPassed) {
            return 'Hired';
        }

        // Get the current stage
        const stageOrder = ['HR', 'TECHNICAL', 'CULTURAL', 'FINAL'];
        let currentStage = 'HR';
        for (const stage of stageOrder) {
            const interview = applicant.interviews.find(i => 
                i.interviewer.interview_type === stage
            );
            if (!interview || stageResults[interview.id]?.result !== 'pass') {
                currentStage = stage;
                break;
            }
        }

        return `${currentStage} Round`;
    };

    useEffect(() => {
        if (jobId) {
            const fetchJobData = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
                    setJobPosting(response.data);

                    const applicantsResponse = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
                    setApplicants(applicantsResponse.data);

                    // Fetch interview results for each applicant
                    const results = {};
                    for (const applicant of applicantsResponse.data) {
                        if (applicant.interviews) {
                            for (const interview of applicant.interviews) {
                                const resultResponse = await axios.get(`http://localhost:5000/api/interview/stages/${interview.id}/result`);
                                results[interview.id] = resultResponse.data;
                            }
                        }
                    }
                    setStageResults(results);
                } catch (err) {
                    setError('Failed to fetch job data');
                    console.error('Error:', err);
                }
            };
            fetchJobData();
        }
    }, [jobId]);

    const grades = [
        'Analyst',
        'Associate',
        'Senior Associate',
        'Assistant Manager',
        'Manager',
        'Manager-1',
        'Senior Manager',
        'Director'
    ];

    const urgencyLevels = [
        'Urgent - Immediate Hire',
        'High Priority',
        'Normal',
        'Low Priority'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobPosting(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = async (e) => {
        console.log('File upload triggered');
        const files = e.target.files;
        if (!files || files.length === 0) {
            console.log('No files selected');
            return;
        }
        console.log('Files selected:', files);

        setLoading(true);
        try {
            // Create FormData for the parser API
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
                console.log('Appending file:', file.name);
            });

            console.log('Sending to parser API...');
            // Step 1: Send files to the parser API
            const parserResponse = await axios.post('http://127.0.0.1:8000/parse-and-rank', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Parser response:', parserResponse.data);

            // Step 2: Send parsed data to backend to create applicants
            await axios.post(
                'http://localhost:5000/api/applicant/from-parsed-resumes',
                {
                    ...parserResponse.data,
                    jobId: jobId // Include the jobId for association
                  
                }
                
            );

            console.log('job id is ', jobId);

            console.log('Applicants created successfully');

            // Step 3: Refresh the applicants list using existing fetchJobData
            const applicantsResponse = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
            setApplicants(applicantsResponse.data);
            setError(null);

        } catch (err) {
            console.error('Error processing CVs:', err);
            setError('Failed to process CVs. Please try again.');
        } finally {
            setLoading(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const updateApplicantStatus = (id, status) => {
        setApplicants(prev =>
            prev.map(applicant =>
                applicant.id === id ? { ...applicant, status } : applicant
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (jobId) {
                await axios.put(`http://localhost:5000/api/jobs/${jobId}`, jobPosting);
            } else {
                await axios.post('http://localhost:5000/api/jobs', jobPosting);
            }
            navigate('/manage-jobs');
        } catch (err) {
            setError('Failed to save job posting');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplicantClick = (e, applicantId) => {
        e.preventDefault();
        navigate(`/interview-tracking/${applicantId}`);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {jobId ? 'Edit Job Posting' : 'Create Job Posting'}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {jobId ? 'Update the job details and manage applicants' : 'Fill in the details to create a new job posting'}
                        </p>
                    </div>
                    {jobId && (
                        <button
                            onClick={() => navigate(`/interview-status/${jobId}`)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            View All Interviews
                        </button>
                    )}
                </div>

                {/* Main Form */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        {/* Basic Info Section */}
                        <div className="p-7">
                            <h2 className="text-lg font-medium text-gray-900 mb-5">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={jobPosting.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Senior Software Engineer"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                                    <select
                                        name="grade"
                                        value={jobPosting.grade}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {grades.map((grade) => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Manager</label>
                                    <input
                                        type="text"
                                        name="hiringManager"
                                        value={jobPosting.hiringManager}
                                        onChange={handleInputChange}
                                        placeholder="e.g., John Smith"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Urgency</label>
                                    <select
                                        name="hiringUrgency"
                                        value={jobPosting.hiringUrgency}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    >
                                        <option value="">Select Urgency</option>
                                        {urgencyLevels.map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Job Details Section */}
                        <div className="p-7">
                            <h2 className="text-lg font-medium text-gray-900 mb-5">Job Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role Overview</label>
                                    <textarea
                                        name="roleOverview"
                                        value={jobPosting.roleOverview}
                                        onChange={handleInputChange}
                                        placeholder="Provide a brief overview of the role..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Responsibilities</label>
                                    <textarea
                                        name="keyResponsibilities"
                                        value={jobPosting.keyResponsibilities}
                                        onChange={handleInputChange}
                                        placeholder="List the key responsibilities..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Skills and Competencies</label>
                                    <textarea
                                        name="keySkillsAndCompetencies"
                                        value={jobPosting.keySkillsAndCompetencies}
                                        onChange={handleInputChange}
                                        placeholder="List required skills and competencies..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="px-7 py-4 bg-gray-50 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/manage')}
                                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    jobId ? 'Update Job' : 'Create Job'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Applicants Section */}
                {jobId && (
                    <div className="bg-gray-50 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Applicants</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'} for this position
                                </p>
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Import CVs
                                </button>
                            </div>
                        </div>

                        {loading && (
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                                <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                                    </div>
                                    <p className="mt-4 text-center text-gray-600">Processing applications...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {applicants.length > 0 ? (
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('name')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Name</span>
                                                    {getSortIcon('name')}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Resume
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('status')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Status</span>
                                                    {getSortIcon('status')}
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('score')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Score</span>
                                                    {getSortIcon('score')}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortApplicants(applicants).map((applicant) => {
                                            let resumeData = {};
                                            let score = null;
                                            
                                            try {
                                                resumeData = JSON.parse(applicant.resume);
                                                score = resumeData?.score || 0;
                                            } catch (error) {
                                                console.error('Error parsing resume data:', error);
                                            }

                                            return (
                                                <tr 
                                                    key={applicant.id}
                                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={(e) => handleApplicantClick(e, applicant.id)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {applicant.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // viewResume(applicant.id);
                                                            }}
                                                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                                        >
                                                            View Resume
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            getApplicantStatus(applicant) === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            getApplicantStatus(applicant) === 'Hired' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {getApplicantStatus(applicant)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            {score !== null ? score.toFixed(1) : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateApplicantStatus(applicant.id, 'Approved')}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateApplicantStatus(applicant.id, 'Rejected')}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by importing CVs for this position</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobPostingForm;
