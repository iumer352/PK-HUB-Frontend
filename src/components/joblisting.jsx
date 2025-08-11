import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import EditJob from './EditJob.jsx';

const ApplicantRow = React.memo(({ 
    applicant, 
    handleApplicantClick, 
    handleScoreHover, 
    setShowScoreDetails,
    handleDeleteApplicant
}) => {
    const [aiStatus, setAiStatus] = React.useState('pending');
    const [interviewStatus, setInterviewStatus] = useState(applicant.interview_status || 'No Interview Scheduled');
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef(null);

    // Function to store AI result in database
    const storeAiResult = async (result) => {
        try {
            await axios.put(`/api/applicant/${applicant.id}/ai-result`, {
                ai_result: result
            });
        } catch (error) {
            console.error('Error storing AI result:', error);
        }
    };

    // Function to fetch AI result from database
    const fetchAiResult = async () => {
        try {
            const response = await axios.get(`/api/applicant/${applicant.id}/ai-result`);
            console.log("ai result is: ",response.data.applicant.ai_result)
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

    // Function to update interview status in the database
    const updateInterviewStatus = async (newStatus) => {
        try {
            await axios.put(`/api/applicant/${applicant.id}/status`, {
                status: newStatus
            });
            setInterviewStatus(newStatus);
        } catch (error) {
            console.error('Error updating interview status:', error);
        }
    };

    // Function to determine and update the interview status
    const determineInterviewStatus = () => {
        let newStatus = 'No Interview Scheduled';
        if (!applicant.interviews || applicant.interviews.length === 0) {
            newStatus = 'No Interview Scheduled';
        } else if (applicant.interviews.some(interview => interview.stages?.some(stage => stage.result === 'fail'))) {
            newStatus = 'Rejected';
        } else if (applicant.interviews.some(interview => interview.stages?.some(stage => stage.stage_id === 4 && stage.result === 'pass' && stage.offer_status === 'pending'))) {
            newStatus = 'Offer Stage';
        } else if (applicant.offer_status === 'accepted') {
            newStatus = 'Offer Accepted';
        } else if (applicant.offer_status === 'rejected') {
            newStatus = 'Offer Rejected';
        } else if (applicant.interviews.some(interview => interview.stages?.some(stage => stage.result === 'Withdrawn'))) {
            newStatus = 'Withdrawn';
        }
        else {
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
                case 1: newStatus = 'In HR Round'; break;
                case 2: newStatus = 'In Cultural Round'; break;
                case 3: newStatus = 'In Technical Round'; break;
                case 4: newStatus = 'In Final Round'; break;
                default: newStatus = 'No Interview Scheduled';
            }
        }
        updateInterviewStatus(newStatus);
    };

    useEffect(() => {
        determineInterviewStatus();
    }, [applicant.interviews, applicant.offer_status]);

    // Add viewResume function here
    const viewResume = async (applicantId) => {
        try {
            const response = await axios.get(
                `/api/applicant/${applicantId}/resume`,
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

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <tr 
            className="hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={(e) => handleApplicantClick(e, applicant.id)}
        >
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 
                         whitespace-nowrap 
                         text-sm lg:text-xs xl:text-sm 2xl:text-base text-gray-500
                         max-w-[180px] truncate"
                         title={applicant.name}>
                {applicant.name}
            </td>
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 
                         whitespace-nowrap 
                         text-sm lg:text-xs xl:text-sm 2xl:text-base text-gray-500">
                <div className="flex flex-col">
                    <span>{new Date(applicant.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}</span>
                </div>
            </td>
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 whitespace-nowrap">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        viewResume(applicant.id);
                    }}
                    className="px-3 lg:px-2 xl:px-3 2xl:px-4 
                             py-1 lg:py-0.5 xl:py-1 2xl:py-1.5 
                             text-sm lg:text-sm xl:text-sm 2xl:text-sm
                             font-medium text-white bg-green-600 
                             rounded-md hover:bg-green-700
                             w-[80px]"
                >
                    view CV
                </button>
            </td>
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 whitespace-nowrap">
                <span className={`px-2 lg:px-2 xl:px-2 2xl:px-2.5 
                               py-1 lg:py-1 xl:py-1 2xl:py-1 
                               inline-flex text-xs lg:text-xs xl:text-xs 2xl:text-sm 
                               leading-5 font-semibold rounded-full ${
                    interviewStatus === 'Rejected' || interviewStatus === 'Offer Rejected' 
                        ? 'bg-red-100 text-red-800' 
                        : interviewStatus === 'Hired' 
                        ? 'bg-green-100 text-green-800' 
                        : interviewStatus === 'Offer Stage'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                }`}>
                    {interviewStatus}
                </span>
            </td>
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 
                         whitespace-nowrap 
                         text-sm lg:text-xs xl:text-sm 2xl:text-base 
                         font-medium cursor-help relative"
                onMouseEnter={(e) => handleScoreHover(e, applicant.resume)}
                onMouseLeave={() => setShowScoreDetails(null)}
            >
                <span className="px-3 lg:px-3 xl:px-3 2xl:px-3 
                               py-1 lg:py-1 xl:py-1 2xl:py-1.5 
                               rounded-full bg-indigo-100 text-indigo-800">
                    {score !== null && !isNaN(score) ? `${Number(score).toFixed(1)}%` : 'N/A'}
                </span>
            </td>
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 whitespace-nowrap">
                <span className={`px-2 lg:px-2 xl:px-2 2xl:px-2.5 
                               py-1 lg:py-1 xl:py-1 2xl:py-1 
                               inline-flex text-xs lg:text-xs xl:text-xs 2xl:text-sm 
                               leading-5 font-semibold rounded-full ${
                    aiStatus === 'rejected' 
                        ? 'bg-red-100 text-red-800' 
                        : aiStatus === 'shortlisted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {aiStatus.charAt(0).toUpperCase() + aiStatus.slice(1)}
                </span>
            </td>
            <td className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                         py-4 lg:py-2 xl:px-3 2xl:py-4 whitespace-nowrap">
                <div className="relative" ref={actionsRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(!showActions);
                        }}
                        className="inline-flex items-center justify-center 
                                 px-3 lg:px-2 xl:px-3 2xl:px-4 
                                 py-1.5 lg:py-1.5 xl:py-1.5 2xl:py-1.5 
                                 border border-transparent 
                                 text-xs lg:text-xs xl:text-xs 2xl:text-sm 
                                 font-medium rounded-md text-gray-700 
                                 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Actions
                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {showActions && (
                        <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(e, 'shortlisted');
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs text-green-700 hover:bg-green-50 flex items-center"
                                    role="menuitem"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accept
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(e, 'rejected');
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs text-red-700 hover:bg-red-50 flex items-center"
                                    role="menuitem"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteApplicant(applicant.id);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs text-red-700 hover:bg-red-50 flex items-center"
                                    role="menuitem"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
});

const JobPostingForm = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const location = useLocation();
    const fileInputRef = useRef(null);
    
    // Add new state for resume processing
    const [isProcessingResumes, setIsProcessingResumes] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stageResults, setStageResults] = useState({});

    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'descending' });

    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const [showScoreDetails, setShowScoreDetails] = useState(null);

    const [successMessage, setSuccessMessage] = useState('');

    const [hiringManagers, setHiringManagers] = useState([]);
    const [functions, setFunctions] = useState(['Analytics and AI', 'Data Transformation', 'Low Code', 'Digital Enablement', 'Innovation and Emerging Tech']);

    const [showJobDetails, setShowJobDetails] = useState(false);

    // Add state for filter
    const [applicantFilter, setApplicantFilter] = useState('all'); // 'all', 'top5', 'top10', 'top15'

    const [searchQuery, setSearchQuery] = useState('');

    // Add state for date filter
    const [dateFilter, setDateFilter] = useState('all');

    // Set initial search query from navigation state
    useEffect(() => {
        if (location.state?.filterApplicant) {
            setSearchQuery(location.state.filterApplicant);
        }
    }, [location.state]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            if (sortConfig.key === 'createdAt') {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
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
            await axios.put(`/api/applicants/${applicantId}/status`, {
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
    
        setLoading(true);
        setIsProcessingResumes(true);
        setProcessingStatus('Starting resume processing...');
    
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
                console.log('Appending file:', file.name);
            });
    
            setProcessingStatus('Analyzing resumes...');
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
    
            formData.append('job_description', jobDescription);
    
            console.log('Sending to parser API...');
            const parserResponse = await axios.post('/fastapi/parse-and-rank', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            const { successful_parses, failed_files } = parserResponse.data;
    
            // Show alert for failed files
            if (failed_files && failed_files.length > 0) {
                const failedNames = failed_files.map(f => f.filename).join('\n');
                alert(`The following files failed to process:\n${failedNames}`);
            }
    
            // If no successful parses, stop here
            if (!successful_parses || successful_parses.length === 0) {
                setError('All resume uploads failed.');
                return;
            }
    
            // Process successful parses and their original files
            const processedParses = await Promise.all(
                successful_parses.map(async (parse) => {
                    const file = Array.from(files).find(f => f.name === parse.filename);
                    if (!file) return null;
    
                    const base64File = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
    
                    return {
                        ...parse,
                        originalFile: {
                            name: file.name,
                            data: base64File.split(',')[1]
                        }
                    };
                })
            );
    
            // Filter out any nulls (just in case)
            const finalParses = processedParses.filter(Boolean);
    
            const payload = {
                successful_parses: finalParses,
                jobId: jobId
            };
    
            console.log('Final payload size:', JSON.stringify(payload).length / 1024, 'KB');
    
            const response = await axios.post(
                '/api/applicant/from-parsed-resumes',
                payload
            );
    
            console.log('Import completed:', response.data);
    
            // Refresh applicants list
            const applicantsResponse = await axios.get(`/api/applicant/job/${jobId}`);
            setApplicants(applicantsResponse.data);
            setError(null);
        } catch (error) {
            console.error('Error processing files:', error);
            setError('Error processing resumes. Please try again.');
        } finally {
            setLoading(false);
            setIsProcessingResumes(false);
            setProcessingStatus('');
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
            const response = await axios.get(`/api/jobs/${jobId}`);
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
                    const response = await axios.get(`/api/jobs/${jobId}`);
                    console.log('Fetched job data:', response.data);
                    
                    // Ensure function value is set correctly
                    const jobData = {
                        ...response.data,
                        functionType: response.data.functionType || '' // Set default if not present
                    };
                    
                    setJobPosting(jobData);

                    // Get applicants for this job
                    const applicantsResponse = await axios.get(`/api/applicant/job/${jobId}`);
                    const applicantsData = applicantsResponse.data;

                    // Fetch interviews for each applicant
                    const applicantsWithInterviews = await Promise.all(
                        applicantsData.map(async (applicant) => {
                            try {
                                const interviewsResponse = await axios.get(`/api/interview/applicant/${applicant.id}`);
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
                } finally {
                    setLoading(false);
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

    // Get unique dates from applicants
    const getUniqueDates = () => {
        const dates = applicants.map(applicant => {
            const date = new Date(applicant.createdAt);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        });
        return ['all', ...new Set(dates)];
    };

    // Add this function to filter applicants by date
    const getFilteredApplicants = () => {
        // First filter by search query
        let filteredApplicants = applicants.filter(applicant => 
            applicant.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Then filter by date if a date is selected
        if (dateFilter !== 'all') {
            filteredApplicants = filteredApplicants.filter(applicant => {
                const applicantDate = new Date(applicant.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                return applicantDate === dateFilter;
            });
        }

        // Then sort applicants by score in descending order
        filteredApplicants = [...filteredApplicants].sort((a, b) => {
            const scoreA = getApplicantScore(a);
            const scoreB = getApplicantScore(b);
            return scoreB - scoreA;
        });

        // Then apply the selected filter
        switch (applicantFilter) {
            case 'Shortlisted':
                return filteredApplicants.filter(applicant => {
                    try {
                        return applicant?.ai_result === 'shortlisted';
                    } catch (error) {
                        return false;
                    }
                });
            case 'Rejected':
                return filteredApplicants.filter(applicant => {
                    try {
                        return applicant?.ai_result === 'rejected';
                    } catch (error) {
                        return false;
                    }
                });
            case 'top5':
                return filteredApplicants.slice(0, 5);
            case 'top10':
                return filteredApplicants.slice(0, 10);
            case 'top15':
                return filteredApplicants.slice(0, 15);
            default:
                return filteredApplicants;
        }
    };

    // Helper function to get applicant score (if not already present)
    const getApplicantScore = (applicant) => {
        try {
            const resumeData = JSON.parse(applicant.resume);
            return resumeData?.score?.Overall_Score || 0;
        } catch (error) {
            console.error('Error parsing resume score:', error);
            return 0;
        }
    };

    // Function to get interview status for an applicant
    const getApplicantInterviewStatus = (applicant) => {
        if (!applicant.interviews || applicant.interviews.length === 0) {
            return 'No Interview Scheduled';
        }

        if (applicant.interviews.some(interview => 
            interview.stages?.some(stage => stage.result === 'fail'))) {
            return 'Rejected';
        }

        if (applicant.interviews.some(interview => 
            interview.stages?.some(stage => 
                stage.stage_id === 4 && stage.result === 'pass' && 
                stage.offer_status === 'pending'))) {
            return 'Offer Stage';
        }

        if (applicant.offer_status === 'accepted') {
            return 'Hired';
        }

        if (applicant.offer_status === 'rejected') {
            return 'Offer Rejected';
        }

        // Get the current stage
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
            case 2: return 'In Cultural Round';
            case 3: return 'In Technical Round';
            case 4: return 'In Final Round';
            default: return 'No Interview Scheduled';
        }
    };

    // Function to determine the latest round across all applicants for a job
    const getLatestRoundForJob = (applicants) => {
        // If no applicants or no interviews scheduled for any applicant
        if (!applicants.length || applicants.every(applicant => 
            getApplicantInterviewStatus(applicant) === 'No Interview Scheduled')) {
            return 'Advertisement';
        }

        // If any applicant is hired, job is completed
        if (applicants.some(applicant => 
            getApplicantInterviewStatus(applicant) === 'Hired')) {
            return 'Completed';
        }

        const stageOrder = {
            'No Interview Scheduled': 0,
            'In HR Round': 1,
            'In Cultural Round': 2,
            'In Technical Round': 3,
            'In Final Round': 4,
            'Offer Stage': 5,
            'Hired': 6,
            'Offer Rejected': 7,
            'Rejected': 8
        };

        let latestStage = 'No Interview Scheduled';
        let highestStageNumber = -1;

        applicants.forEach(applicant => {
            const status = getApplicantInterviewStatus(applicant);
            const stageNumber = stageOrder[status];

            // Only update if it's an active stage (not rejected)
            if (stageNumber > highestStageNumber && 
                !['Rejected', 'Offer Rejected'].includes(status)) {
                highestStageNumber = stageNumber;
                latestStage = status;
            }
        });

        return latestStage;
    };

    // Function to update job status
    const updateJobStatus = async (jobId, applicants) => {
        try {
            const jobStatus = getLatestRoundForJob(applicants);
            
            await axios.patch(`/api/jobs/${jobId}/jobStatus`, {
                jobStatus: jobStatus
            });

            console.log(`Updated job ${jobId} status to: ${jobStatus}`);
        } catch (error) {
            console.error('Error updating job status:', error);
        }
    };

    // Update job status whenever applicants change
    useEffect(() => {
        if (jobId && applicants && applicants.length > 0) {
            updateJobStatus(jobId, applicants);
        }
    }, [jobId, applicants]);

    const handleDeleteApplicant = async (applicantId) => {
        if (!window.confirm('Are you sure you want to delete this applicant?')) return;
        try {
            await axios.delete(`/api/applicant/${applicantId}`);
            setApplicants(prev => prev.filter(applicant => applicant.id !== applicantId));
            setSuccessMessage('Applicant deleted successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setError('Failed to delete applicant.');
            setTimeout(() => setError(null), 3000);
            console.error(error);
        }
    };

    // Add this function to get paginated applicants
    const getPaginatedApplicants = () => {
        const filteredApplicants = getFilteredApplicants();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredApplicants.slice(startIndex, endIndex);
    };

    // Add this function to get total pages
    const getTotalPages = () => {
        const filteredApplicants = getFilteredApplicants();
        return Math.ceil(filteredApplicants.length / itemsPerPage);
    };

    // Add pagination controls component
    const PaginationControls = () => {
        const totalPages = getTotalPages();
        
        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex justify-between flex-1 sm:hidden">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, getFilteredApplicants().length)}
                            </span>{' '}
                            of <span className="font-medium">{getFilteredApplicants().length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                        currentPage === index + 1
                                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-8xl mx-auto py-8 lg:py-6 xl:py-8 2xl:py-10 px-4 sm:px-6 lg:px-8 2xl:px-10">
                {/* Header Section - bigger for 2xl */}
                <div className="mb-8 lg:mb-4 xl:mb-8 2xl:mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl lg:text-lg xl:text-2xl 2xl:text-4xl font-bold text-gray-900">
                            Manage Applicants for {jobPosting.title || 'Position'}
                        </h1>
                        <p className="mt-1 text-sm lg:text-xs xl:text-sm 2xl:text-lg text-gray-500">
                            Manage job posting and applicants
                        </p>
                    </div>
                    <button
                        onClick={toggleJobDetails}
                        className="px-4 lg:px-2 xl:px-4 2xl:px-6 
                                 py-2 lg:py-1 xl:py-2 2xl:py-3 
                                 text-sm lg:text-xs xl:text-sm 2xl:text-lg 
                                 font-medium text-indigo-600 bg-white rounded-md 
                                 shadow-sm hover:bg-indigo-50 flex items-center gap-2"
                    >
                        {showJobDetails ? 'Hide Details' : 'View Details'}
                        <svg 
                            className={`w-5 h-5 lg:w-3 lg:h-3 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 transition-transform ${showJobDetails ? 'transform rotate-180' : ''}`} 
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Job Header */}
                            <div className="border-b border-gray-200 pb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{jobPosting.title}</h2>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {jobPosting.grade}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {jobPosting.functionType}
                                    </span>
                                    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        jobPosting.hiringUrgency === 'Urgent - Immediate Hire'
                                            ? 'bg-red-100 text-red-800'
                                            : jobPosting.hiringUrgency === 'High Priority'
                                            ? 'bg-orange-100 text-orange-800'
                                            : jobPosting.hiringUrgency === 'Normal'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {jobPosting.hiringUrgency}
                                    </span>
                                </div>
                            </div>

                            {/* Job Content */}
                            <div className="py-6 space-y-6">
                                {/* Role Overview */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Role Overview</h3>
                                    <div className="prose prose-sm max-w-none text-gray-600">
                                        {jobPosting.roleOverview.split('\n').map((paragraph, index) => (
                                            <p key={index} className="mb-3">{paragraph}</p>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Responsibilities */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h3>
                                    <div className="prose prose-sm max-w-none text-gray-600">
                                        {jobPosting.keyResponsibilities.split('\n').map((responsibility, index) => (
                                            <p key={index} className="mb-2 flex items-start">
                                                <span className="text-blue-600 mr-2">•</span>
                                                {responsibility}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Skills and Competencies */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Skills and Competencies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {jobPosting.keySkillsAndCompetencies.split(',').map((skill, index) => (
                                            <span 
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">Hiring Manager</h4>
                                        <p className="text-gray-900">{jobPosting.hiringManager}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">Demanded For</h4>
                                        <p className="text-gray-900">{jobPosting.demandedFor}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="border-t border-gray-200 pt-4 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowJobDetails(false);
                                        // You can add navigation to edit mode here if needed
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Job Details
                                </button>
                            </div>
                        </div>
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

                {/* Add Filter Section - bigger for 2xl */}
                <div className="mb-6 lg:mb-5 xl:mb-6 2xl:mb-8 flex flex-col space-y-4">
                    {/* Status Filters */}
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-4 lg:space-x-4 xl:space-x-4 2xl:space-x-6">
                            <button
                                onClick={() => setApplicantFilter('all')}
                                className={`px-4 lg:px-4 xl:px-4 2xl:px-6 
                                         py-2 lg:py-2 xl:py-2 2xl:py-3 
                                         rounded-md text-sm lg:text-base xl:text-base 2xl:text-lg font-medium ${
                                    applicantFilter === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                All Candidates
                            </button>
                            <button
                                onClick={() => setApplicantFilter('Shortlisted')}
                                className={`px-4 lg:px-4 xl:px-4 2xl:px-6 
                                         py-2 lg:py-2 xl:py-2 2xl:py-3 
                                         rounded-md text-sm lg:text-base xl:text-base 2xl:text-lg font-medium ${
                                    applicantFilter === 'Shortlisted'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Shortlisted
                            </button>
                            <button
                                onClick={() => setApplicantFilter('Rejected')}
                                className={`px-4 lg:px-4 xl:px-4 2xl:px-6 
                                         py-2 lg:py-2 xl:py-2 2xl:py-3 
                                         rounded-md text-sm lg:text-base xl:text-base 2xl:text-lg font-medium ${
                                    applicantFilter === 'Rejected'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    {/* Search and Date Filter Row */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by applicant name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-9 3.75h.008v.008H12v.008z" />
                                </svg>
                            </div>
                        </div>

                        {/* Date Filter Dropdown */}
                        <div className="w-full md:w-64">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Dates</option>
                                {getUniqueDates().filter(date => date !== 'all').map((date, index) => (
                                    <option key={index} value={date}>
                                        {date}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Top N Filters */}
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-4 lg:space-x-4 xl:space-x-4 2xl:space-x-6">
                            <button
                                onClick={() => setApplicantFilter('top5')}
                                className={`px-4 lg:px-4 xl:px-4 2xl:px-6 
                                         py-2 lg:py-2 xl:py-2 2xl:py-3 
                                         rounded-md text-sm lg:text-base xl:text-base 2xl:text-lg font-medium ${
                                    applicantFilter === 'top5'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Top 5
                            </button>
                            <button
                                onClick={() => setApplicantFilter('top10')}
                                className={`px-4 lg:px-4 xl:px-4 2xl:px-6 
                                         py-2 lg:py-2 xl:py-2 2xl:py-3 
                                         rounded-md text-sm lg:text-base xl:text-base 2xl:text-lg font-medium ${
                                    applicantFilter === 'top10'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Top 10
                            </button>
                            <button
                                onClick={() => setApplicantFilter('top15')}
                                className={`px-4 lg:px-4 xl:px-4 2xl:px-6 
                                         py-2 lg:py-2 xl:py-2 2xl:py-3 
                                         rounded-md text-sm lg:text-base xl:text-base 2xl:text-lg font-medium ${
                                    applicantFilter === 'top15'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Top 15
                            </button>
                        </div>

                        {/* Show count of displayed applicants */}
                        <div className="text-sm lg:text-base xl:text-base 2xl:text-lg text-gray-600">
                            Showing {getFilteredApplicants().length} of {applicants.length} candidates
                        </div>
                    </div>
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

                        {/* Loading Bar */}
                        {loading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
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
                                                className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                                                         py-3 lg:py-2 xl:py-3 2xl:py-4 
                                                         text-left text-xs lg:text-[11px] xl:text-xs 2xl:text-base 
                                                         font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Name</span>
                                                    {getSortIcon('name')}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <button
                                                    className="flex items-center space-x-1"
                                                    onClick={() => requestSort('createdAt')}
                                                >
                                                    <span>Date Added</span>
                                                    {getSortIcon('createdAt')}
                                                </button>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Resume
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                                                         py-3 lg:py-2 xl:py-3 2xl:py-4 
                                                         text-left text-xs lg:text-[11px] xl:text-xs 2xl:text-base 
                                                         font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                                                className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                                                         py-3 lg:py-2 xl:py-3 2xl:py-4 
                                                         text-left text-xs lg:text-[11px] xl:text-xs 2xl:text-base 
                                                         font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Score</span>
                                                    {getSortIcon('score')}
                                                </div>
                                            </th>
                                            <th 
                                                scope="col" 
                                                className="px-6 lg:px-3 xl:px-6 2xl:px-7 
                                                         py-3 lg:py-2 xl:py-3 2xl:py-4 
                                                         text-left text-xs lg:text-[11px] xl:text-xs 2xl:text-base 
                                                         font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                                        {getPaginatedApplicants().map((applicant) => (
                                            <ApplicantRow
                                                key={applicant.id}
                                                applicant={applicant}
                                                handleApplicantClick={handleApplicantClick}
                                                handleScoreHover={handleScoreHover}
                                                setShowScoreDetails={setShowScoreDetails}
                                                handleDeleteApplicant={handleDeleteApplicant}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4">
                                    <PaginationControls />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 lg:py-8 xl:py-12 2xl:py-16 
                                            bg-white rounded-lg border-2 border-dashed border-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 lg:h-10 xl:h-12 2xl:h-16 
                                                  w-12 lg:w-10 xl:w-12 2xl:w-16 text-gray-400" 
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm lg:text-xs xl:text-sm 2xl:text-lg font-medium text-gray-900">
                                    No applicants yet
                                </h3>
                                <p className="mt-1 text-sm lg:text-xs xl:text-sm 2xl:text-base text-gray-500">
                                    Get started by importing CVs for this position
                                </p>
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

            {/* Resume Processing Modal */}
            {isProcessingResumes && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <h3 className="text-lg font-medium text-gray-900">Processing Resumes</h3>
                            <p className="text-sm text-gray-500 text-center">{processingStatus}</p>
                        </div>
                    </div>
                </div>
            )}
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