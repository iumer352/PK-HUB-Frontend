import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import EditJob from './EditJob.jsx';

const ApplicantRow = React.memo(({ 
    applicant, 
    handleApplicantClick, 
    handleScoreHover, 
    setShowScoreDetails
}) => {
    const [aiStatus, setAiStatus] = React.useState('pending');

    
    // Function to store AI result in database
    const storeAiResult = async (result) => {
        try {
            await axios.put(`http://localhost:5000/api/applicant/${applicant.id}/ai-result`, {
                ai_result: result
            });
        } catch (error) {
            console.error('Error storing AI result:', error);
        }
    };

    // Function to fetch AI result from database
    const fetchAiResult = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/applicant/${applicant.id}/ai-result`);
            return response.data.applicant.ai_result;
        } catch (error) {
            console.error('Error fetching AI result:', error);
            return null;
        }
    };

    // Process score and set initial AI result
    React.useEffect(() => {
        const processScore = async () => {
            try {
                const resumeData = JSON.parse(applicant.resume);
                const score = resumeData?.score?.Overall_Score;
                
                if (score !== undefined && score !== null) {
                    // First check if there's an existing AI result
                    const existingResult = await fetchAiResult();
                    
                    if (!existingResult) {
                        // If no existing result, determine and store based on score
                        const initialResult = Number(score) < 50 ? 'rejected' : 'shortlisted';
                        await storeAiResult(initialResult);
                        setAiStatus(initialResult);
                    } else {
                        // If result exists, use it
                        setAiStatus(existingResult);
                    }
                }
            } catch (error) {
                console.error('Error processing score:', error);
            }
        };

        processScore();
    }, [applicant.id, applicant.resume]);

    // Handle manual status update through action buttons
    const handleStatusUpdate = async (e, newStatus) => {
        e.stopPropagation();
        try {
            await storeAiResult(newStatus);
            setAiStatus(newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    let score = null;
    try {
        const resumeData = JSON.parse(applicant.resume);
        const rawScore = resumeData?.score?.Overall_Score;
        if (rawScore !== undefined && rawScore !== null) {
            score = Number(rawScore);
            if (isNaN(score)) score = 0;
        }
    } catch (error) {
        console.error('Error parsing resume data:', error);
    }

    const interviewStatus = !applicant.interviews || applicant.interviews.length === 0
        ? 'No Interview Scheduled'
        : applicant.interviews.some(interview => interview.stages?.some(stage => stage.result === 'fail'))
        ? 'Rejected'
        : applicant.interviews.some(interview => interview.stages?.some(stage => stage.stage_id === 4 && stage.result === 'pass'))
        ? 'Hired'
        : (() => {
            let currentStageId = 1;
            applicant.interviews.forEach(interview => {
                if (interview.stages?.[0]) {
                    const stageId = interview.stages[0].stage_id;
                    if (stageId > currentStageId) {
                        currentStageId = stageId;
                    }
                }
            });
            switch (currentStageId) {
                case 1: return 'In HR Round';
                case 2: return 'In Technical Round';
                case 3: return 'In Cultural Round';
                case 4: return 'In Final Round';
                default: return 'No Interview Scheduled';
            }
        })();

    // Add viewResume function here
    const viewResume = async (applicantId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/applicant/${applicantId}/resume`,
                { responseType: 'blob' }
            );
            
            // Create blob URL and open in new tab
            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] 
            });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        } catch (error) {
            console.error('Error viewing resume:', error);
        }
    };

    return (
        <tr 
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
                        viewResume(applicant.id);
                    }}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    View Resume
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    interviewStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                    interviewStatus === 'Hired' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {interviewStatus}
                </span>
            </td>
            <td 
                className="px-6 py-4 whitespace-nowrap text-sm font-medium cursor-help relative"
                onMouseEnter={(e) => handleScoreHover(e, applicant.resume)}
                onMouseLeave={() => setShowScoreDetails(null)}
            >
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    {score !== null && !isNaN(score) ? `${Number(score).toFixed(1)}%` : 'N/A'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    aiStatus === 'rejected' 
                        ? 'bg-red-100 text-red-800' 
                        : aiStatus === 'shortlisted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {aiStatus.charAt(0).toUpperCase() + aiStatus.slice(1)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => handleStatusUpdate(e, 'shortlisted')}
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors w-16"
                    >
                        Accept
                    </button>
                    <button
                        onClick={(e) => handleStatusUpdate(e, 'rejected')}
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors w-16"
                    >
                        Reject
                    </button>
                </div>
            </td>
        </tr>
    );
});

const JobPostingForm = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const fileInputRef = useRef(null);

    
    
    
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

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stageResults, setStageResults] = useState({});

    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'descending' });

    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const [showScoreDetails, setShowScoreDetails] = useState(null);

    const [successMessage, setSuccessMessage] = useState('');

    const [hiringManagers, setHiringManagers] = useState([]);
    const [functions, setFunctions] = useState(['Analytics and AI', 'Data Transformation', 'Low Code', 'Digital Enablement', 'Innovation and Emerging Tech']);

    const [showJobDetails, setShowJobDetails] = useState(false);

    useEffect(() => {
        const fetchHiringManagers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/hiring-managers');
                setHiringManagers(response.data);
            } catch (err) {
                console.error('Error fetching hiring managers:', err);
            }
        };

        fetchHiringManagers();
    }, []);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        // If switching away from score, remember the previous sort
        if (key !== 'score') {
            setSortConfig({ key, direction });
        } else {
            // For score, always set to descending
            setSortConfig({ key: 'score', direction: 'descending' });
        }
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        // For score column, always show descending icon
        if (columnName === 'score') {
            return (
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                const getScore = (resume) => {
                    try {
                        const data = JSON.parse(resume);
                        return data?.score?.Overall_Score || 0;
                    } catch (error) {
                        return 0;
                    }
                };
                const scoreA = getScore(a.resume);
                const scoreB = getScore(b.resume);
                // Always sort score in descending order
                return scoreB - scoreA;
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
            return 'No Interview Scheduled';
        }

        // Check if any interview has failed
        const hasFailedInterview = applicant.interviews.some(interview => 
            interview.stages?.some(stage => stage.result === 'fail')
        );
        if (hasFailedInterview) {
            return 'Rejected';
        }

        // Check if final round is passed
        const finalRoundPassed = applicant.interviews.some(interview => 
            interview.stages?.some(stage => 
                stage.stage_id === 4 && stage.result === 'pass'
            )
        );
        if (finalRoundPassed) {
            return 'Hired';
        }

        // Get the current stage
        let currentStageId = 1; // Start with HR
        let currentStageName = 'HR';

        // Find the highest stage that's either scheduled or completed
        applicant.interviews.forEach(interview => {
            if (interview.stages?.[0]) {
                const stageId = interview.stages[0].stage_id;
                if (stageId > currentStageId) {
                    currentStageId = stageId;
                    currentStageName = interview.interviewer.interview_type;
                }
            }
        });

        // Map stage IDs to readable names
        switch (currentStageId) {
            case 1: return 'In HR Round';
            case 2: return 'In Technical Round';
            case 3: return 'In Cultural Round';
            case 4: return 'In Final Round';
            default: return 'No Interview Scheduled';
        }
    };

    const getApplicationStatus = (applicant) => {
        try {
            const resumeData = JSON.parse(applicant.resume);
            const score = resumeData?.score?.Overall_Score || 0;
            return score < 55 ? 'rejected' : 'shortlisted';
        } catch (error) {
            console.error('Error parsing resume data:', error);
            return 'pending';
        }
    };

    // Update application status
    const updateApplicationStatus = async (applicantId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/applicants/${applicantId}/status`, {
                status: newStatus
            });
            
            // Update local state
            setApplicants(applicants.map(app => 
                app.id === applicantId 
                    ? { 
                        ...app, 
                        resume: JSON.stringify({
                            ...JSON.parse(app.resume),
                            score: newStatus === 'shortlisted' ? 75 : 45 // Set score based on status
                        })
                    }
                    : app
            ));
            
            setSuccessMessage('Status updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleScoreHover = (event, resumeData) => {
        if (!resumeData) return;
        
        const rect = event.target.getBoundingClientRect();
        setHoverPosition({
            x: rect.right + 10,
            y: rect.top
        });
        
        try {
            const parsedData = typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData;
            setShowScoreDetails(parsedData);
        } catch (error) {
            console.error('Error parsing resume data:', error);
        }
    };

    const handleFileUpload = async (e) => {
        console.log('File upload triggered');
        const files = e.target.files;
        if (!files || files.length === 0) {
            console.log('No files selected');
            return;
        }
        
        // Log file sizes
        Array.from(files).forEach(file => {
            console.log(`File ${file.name} size:`, file.size / 1024, 'KB');
        });

        setLoading(true);
        try {
            // Create FormData for the parser API
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
                console.log('Appending file:', file.name);
            });

            // Create job description from all job details
            const jobDescription = `
Job Title: ${jobPosting.title}
Grade: ${jobPosting.grade}
Hiring Urgency: ${jobPosting.hiringUrgency}

Role Overview:
${jobPosting.roleOverview}

Key Responsibilities:
${jobPosting.keyResponsibilities}

Key Skills and Competencies:
${jobPosting.keySkillsAndCompetencies}
            `.trim();

            // Debug: Log the job description
            console.log('Job Description being sent:', jobDescription);

            // Add job description to FormData
            formData.append('job_description', jobDescription);

            // Debug: Log FormData contents
            for (let pair of formData.entries()) {
                console.log('FormData entry:', pair[0], pair[1]);
            }

            console.log('Sending to parser API...');
            // Step 1: Send files to the parser API
            const parserResponse = await axios.post('http://127.0.0.1:8000/parse-and-rank', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Parser API Request Details:', {
                url: 'http://127.0.0.1:8000/parse-and-rank',
                formDataEntries: Array.from(formData.entries()).map(entry => entry[0]),
                jobDescriptionLength: jobDescription.length
            });
            console.log('Parser response:', parserResponse.data);

            // Step 2: Process files and add them to parsed data
            const processedParses = await Promise.all(
                parserResponse.data.successful_parses.map(async (parse, index) => {
                    const file = files[index];
                    const reader = new FileReader();
                    
                    // Convert file to base64
                    const base64File = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });

                    console.log(`Base64 size for ${file.name}:`, base64File.length / 1024, 'KB');

                    // Create a more compact version of the file data
                    const compactData = {
                        ...parse,
                        originalFile: {
                            name: file.name,
                            // Only include the actual base64 data, not the data URL prefix
                            data: base64File.split(',')[1]
                        }
                    };

                    return compactData;
                })
            );

            // Log the size of the final payload
            const payload = {
                ...parserResponse.data,
                successful_parses: processedParses,
                jobId: jobId
            };
            console.log('Final payload size:', JSON.stringify(payload).length / 1024, 'KB');

            // Step 3: Send parsed data with files to backend
            const response = await axios.post(
                'http://localhost:5000/api/applicant/from-parsed-resumes',
                payload
            );

            console.log('Import completed:', response.data);

            // Refresh applicants list
            const applicantsResponse = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
            setApplicants(applicantsResponse.data);
            setError(null);
        } catch (error) {
            console.error('Error processing files:', error);
            if (error.response) {
                console.error('Response error:', error.response.status, error.response.data);
            }
            setError('Error processing resumes. Please try again.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleJobUpdateSuccess = () => {
        // Refresh applicants list or perform other necessary updates
        fetchApplicants();
    };
    const handleApplicantClick = async (e, applicantId) => {
        e.preventDefault();
        try {
            // Find the applicant with the score details
            const applicant = applicants.find(app => app.id === applicantId);
            
            // Fetch complete job details
            const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
            console.log('Complete job details:', response.data);
            
            // Pass job data and score details to interview tracking
            navigate(`/interview-tracking/${applicantId}`, { 
                state: { 
                    jobDetails: response.data,
                    scoreDetails: applicant?.score
                }
            });
        } catch (err) {
            console.error('Error fetching job details:', err);
            setError('Failed to fetch job details');
        }
    };

    useEffect(() => {
        if (jobId) {
            const fetchJobData = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
                    console.log('Fetched job data:', response.data);
                    
                    // Ensure function value is set correctly
                    const jobData = {
                        ...response.data,
                        functionType: response.data.functionType || '' // Set default if not present
                    };
                    
                    setJobPosting(jobData);

                    // Get applicants for this job
                    const applicantsResponse = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
                    const applicantsData = applicantsResponse.data;

                    // Fetch interviews for each applicant
                    const applicantsWithInterviews = await Promise.all(
                        applicantsData.map(async (applicant) => {
                            try {
                                const interviewsResponse = await axios.get(`http://localhost:5000/api/interview/applicant/${applicant.id}`);
                                return {
                                    ...applicant,
                                    interviews: interviewsResponse.data
                                };
                            } catch (err) {
                                console.error(`Error fetching interviews for applicant ${applicant.id}:`, err);
                                return {
                                    ...applicant,
                                    interviews: []
                                };
                            }
                        })
                    );

                    setApplicants(applicantsWithInterviews);

                } catch (err) {
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobPosting(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add toggle function
    const toggleJobDetails = () => {
        setShowJobDetails(!showJobDetails);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Job Posting
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage job posting and applicants
                        </p>
                    </div>
                    <button
                        onClick={toggleJobDetails}
                        className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-md shadow-sm hover:bg-indigo-50 flex items-center gap-2"
                    >
                        {showJobDetails ? 'Hide Details' : 'View Details'}
                        <svg 
                            className={`w-5 h-5 transition-transform ${showJobDetails ? 'transform rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Job Details Dropdown */}
                {showJobDetails && (
                    <div className="mb-8 transition-all duration-300 ease-in-out">
                        <EditJob 
                            jobId={jobId} 
                            onSuccess={() => setShowJobDetails(false)} 
                            isDropdown={true}
                        />
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {successMessage}
                    </div>
                )}

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
                                            >
                                                <button
                                                    className="flex items-center space-x-1"
                                                    onClick={() => requestSort('status')}
                                                >
                                                    <span>Interview Status</span>
                                                    {getSortIcon('status')}
                                                </button>
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Score</span>
                                                    {getSortIcon('score')}
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            >
                                                <button
                                                    className="flex items-center space-x-1"
                                                    onClick={() => requestSort('aiStatus')}
                                                >
                                                    <span>AI Result</span>
                                                    {getSortIcon('aiStatus')}
                                                </button>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortApplicants(applicants).map((applicant) => (
                                            <ApplicantRow
                                                key={applicant.id}
                                                applicant={applicant}
                                                handleApplicantClick={handleApplicantClick}
                                                handleScoreHover={handleScoreHover}
                                                setShowScoreDetails={setShowScoreDetails}
                                            />
                                        ))}
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
                {showScoreDetails && (
                    <ScoreDetailsModal 
                        resumeData={showScoreDetails} 
                        position={hoverPosition}
                    />
                )}
            </div>
        </div>
    );
};

const ScoreDetailsModal = ({ resumeData, position }) => {
    if (!resumeData || !position) return null;

    const scoreData = resumeData?.score;
    if (!scoreData) return null;

    // Log the score details being shown in the modal
    console.log('Score Details in Modal:', {
        score: scoreData,
        evaluation: scoreData.Evaluation,
        recommendation: scoreData.Recommendation
    });

    // Calculate position to keep modal within viewport
    const modalWidth = 384; // w-96 = 24rem = 384px
    const modalHeight = 300; // approximate max height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const padding = 80; // padding from edges

    // Calculate left position
    let left = position.x;
    if (left + modalWidth > windowWidth - padding) {
        left = position.x - modalWidth - padding;
    }
    // Ensure minimum padding from left edge
    left = Math.max(padding, left);

    // Calculate top position
    let top = position.y;
    const bottomSpace = windowHeight - top;
    
    // If there's not enough space below, show above the cursor
    if (bottomSpace < modalHeight + padding) {
        top = Math.max(padding, windowHeight - modalHeight - padding);
    }

    return (
        <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl p-4 w-96 max-h-[60vh] overflow-y-auto"
            style={{ 
                left,
                top,
                maxHeight: `calc(100vh - ${padding * 2}px)`,
                transform: 'none'
            }}
        >
            <div className="space-y-4">
                {/* Pros */}
                {scoreData.Evaluation?.Pros && scoreData.Evaluation.Pros.length > 0 && (
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-green-600">Pros:</span>
                        <ul className="list-disc list-inside space-y-1">
                            {scoreData.Evaluation.Pros.map((pro, index) => (
                                <li key={index} className="text-sm text-gray-600 break-words">{pro}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cons */}
                {scoreData.Evaluation?.Cons && scoreData.Evaluation.Cons.length > 0 && (
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-red-600">Cons:</span>
                        <ul className="list-disc list-inside space-y-1">
                            {scoreData.Evaluation.Cons.map((con, index) => (
                                <li key={index} className="text-sm text-gray-600 break-words">{con}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Recommendation */}
                {scoreData.Recommendation && (
                    <div className="pt-2 border-t">
                        <span className="text-sm font-medium text-indigo-600">Recommendation: </span>
                        <span className="text-sm text-gray-900 break-words">{scoreData.Recommendation}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobPostingForm;