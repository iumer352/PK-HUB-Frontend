import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllApplicantsModal = ({ show, onClose, applicantsData, selectedSolution }) => {
  const navigate = useNavigate();
  const [jobFilter, setJobFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [interviewStatusFilter, setInterviewStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 10;

  const handleStatusFilterChange = (e) => {
    setInterviewStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filteredApplicants = applicantsData.filter(applicant => {
    // Check name filter
    const nameMatch = applicant.name.toLowerCase().includes(nameFilter.toLowerCase());
    
    // Check job filter - add null checks
    const jobMatch = applicant.Job && applicant.Job.title 
      ? applicant.Job.title.toLowerCase().includes(jobFilter.toLowerCase())
      : false;
    
    // Check interview status filter
    const applicantStatus = applicant.status || applicant.interviewStatus || '';
    const statusMatch = 
      interviewStatusFilter === 'all' || 
      applicantStatus.toLowerCase() === interviewStatusFilter.toLowerCase();
    
    // Check solution filter - add null checks
    const solutionMatch = 
      selectedSolution === 'all' || 
      (applicant.Job && applicant.Job.functionType 
        ? applicant.Job.functionType.toLowerCase() === selectedSolution.toLowerCase()
        : false);
    
    // Apply all filters together
    return nameMatch && jobMatch && statusMatch && solutionMatch;
  });

  const getAIscore = (resumeData) => {
    try{
        const parsedData = JSON.parse(resumeData);
        return parsedData.score.Overall_Score
    }
    catch(error){
        console.log("error parsing json ",error);
    }

  }

  // Sort applicants by hiring urgency
  const sortedApplicants = filteredApplicants.sort((a, b) => {
    const priorityOrder = { 'high priority': 1, 'normal': 2, 'low priority': 3 };
    
    const aPriority = a.Job && a.Job.hiringUrgency 
      ? priorityOrder[a.Job.hiringUrgency.toLowerCase()] || 999
      : 999;
      
    const bPriority = b.Job && b.Job.hiringUrgency 
      ? priorityOrder[b.Job.hiringUrgency.toLowerCase()] || 999
      : 999;
      
    return aPriority - bPriority;
  });

  const indexOfLastApplicant = currentPage * applicantsPerPage;
  const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
  const currentApplicants = sortedApplicants.slice(indexOfFirstApplicant, indexOfLastApplicant);

  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in hr round':
        return 'bg-indigo-100 text-indigo-800';
      case 'in cultural round':
        return 'bg-purple-100 text-purple-800';
      case 'in technical round':
        return 'bg-violet-100 text-violet-800';
      case 'in final round':
        return 'bg-fuchsia-100 text-fuchsia-800';
      case 'offer accepted':
        return 'bg-emerald-100 text-emerald-800';
      case 'offer rejected':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAIResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Function to handle applicant click
  const handleApplicantClick = (applicant) => {
    // Close the modal
    onClose();
    // Navigate to the job listing page with the job ID and applicant name for filtering
    navigate(`/joblisting/${applicant.JobId}`, {
      state: {
        filterApplicant: applicant.name
      }
    });
  };

  return (
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
            className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Applicants</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredApplicants.length} applicants found
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Filters */}
            <div className="mb-8 space-y-4">
              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by applicant name..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm placeholder-gray-400"
                  />
                </div>

                {/* Job Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm placeholder-gray-400"
                  />
                </div>

                {/* Interview Status Filter */}
                <div>
                  <select
                    value={interviewStatusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm text-gray-600 bg-white"
                  >
                    <option value="all">All Interview Statuses</option>
                    <option value="in hr round">In HR Round</option>
                    <option value="in cultural round">In Cultural Round</option>
                    <option value="in technical round">In Technical Round</option>
                    <option value="in final round">In Final Round</option>
                    <option value="no interview scheduled">No Interview Scheduled</option>
                    <option value="offer accepted">Offer Accepted</option>
                    <option value="offer rejected">Offer Rejected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-500">
                Showing {currentApplicants.length} of {filteredApplicants.length} applicants
              </div>
            </div>

            {/* Table Headers */}
            <div className="bg-gray-50 rounded-t-lg border border-gray-200">
              <div className="grid grid-cols-6 gap-4 px-6 py-3">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant Name</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Applied For</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Solution</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Interview Status</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">AI Reccomendation</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">AI Score</div>
              </div>
            </div>

            {/* Applicants List */}
            <div className="border-x border-gray-200">
              {currentApplicants.map((applicant, index) => (
                <div 
                  key={applicant.id}
                  className={`grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors
                            ${index !== currentApplicants.length - 1 ? 'border-b border-gray-200' : ''}`}
                  onClick={() => handleApplicantClick(applicant)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                  <div className="text-sm text-gray-600">{applicant.Job?.title || 'N/A'}</div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {applicant.Job?.functionType || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                      {applicant.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAIResultColor(applicant.ai_result)}`}>
                      {applicant.ai_result || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-black-800">
                      {console.log("applicant score is ", typeof applicant?.resume)}
                      {getAIscore(applicant.resume)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-b-lg border-x border-b border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
                           hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md 
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AllApplicantsModal; 