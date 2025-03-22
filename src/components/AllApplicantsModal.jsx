import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

const AllApplicantsModal = ({ show, onClose, applicantsData }) => {
  const [jobFilter, setJobFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  const filteredApplicants = applicantsData.filter(applicant => {
    const nameMatch = applicant.name.toLowerCase().includes(nameFilter.toLowerCase());
    const jobMatch = applicant.Job.title.toLowerCase().includes(jobFilter.toLowerCase());

    // If both filters have values, check both conditions
    if (nameFilter && jobFilter) {
      return nameMatch && jobMatch;
    }
    // If only name filter has value
    if (nameFilter) {
      return nameMatch;
    }
    // If only job filter has value
    if (jobFilter) {
      return jobMatch;
    }
    // If no filters, return all applicants
    return true;
  });

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
      case 'offer stage':
        return 'bg-emerald-100 text-emerald-800';
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
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by applicant name..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by job title..."
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Applicants List */}
            <div>
              {/* Table Headers */}
              <div className="grid grid-cols-5 gap-4 mb-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Applicant Name</div>
                <div className="text-sm font-medium text-gray-500">Job Applied For</div>
                <div className="text-sm font-medium text-gray-500">Solution</div>
                <div className="text-sm font-medium text-gray-500">Interview Status</div>
                <div className="text-sm font-medium text-gray-500">AI Recommendation</div>
               
              </div>

              {/* Applicants */}
              <div className="space-y-2">
                {filteredApplicants.map((applicant) => (
                  <div 
                    key={applicant.id} 
                    className="grid grid-cols-5 gap-4 items-center px-4 py-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Applicant Name */}
                    <div>
                      <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                    </div>

                    {/* Job Applied For */}
                    <div>
                      <p className="text-sm text-gray-700">{applicant.Job.title}</p>
                    </div>

                    {/* Solution/Function Type */}
                    <div>
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700">
                        {applicant.Job.functionType}
                      </span>
                    </div>

                    {/* Interview Status */}
                    <div>
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(applicant.status)}`}>
                        {applicant.status}
                      </span>
                    </div>

                    {/* AI Result */}
                    <div>
                      <span className={`px-3 py-1 text-sm rounded-full ${getAIResultColor(applicant.ai_result)}`}>
                        {applicant.ai_result}
                      </span>
                    </div>

                    {/* Action Button */}
                    
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AllApplicantsModal; 