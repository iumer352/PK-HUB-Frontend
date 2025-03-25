import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

const AllPositionsModal = ({ show, onClose, jobsData }) => {
  const [titleFilter, setTitleFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [solutionFilter, setSolutionFilter] = useState('');
  const [demandedForFilter, setDemandedForFilter] = useState('');

  const filteredJobs = Array.isArray(jobsData) ? jobsData.filter(job => {
    const titleMatch = job.title.toLowerCase().includes(titleFilter.toLowerCase());
    const gradeMatch = job.grade.toLowerCase().includes(gradeFilter.toLowerCase());
    const solutionMatch = job.functionType?.toLowerCase().includes(solutionFilter.toLowerCase()) || !solutionFilter;
    const demandedForMatch = job.demandedFor?.toLowerCase().includes(demandedForFilter.toLowerCase()) || !demandedForFilter;
    return titleMatch && gradeMatch && solutionMatch && demandedForMatch;
  }) : [];

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
                <h2 className="text-2xl font-bold text-gray-900">All Positions</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredJobs.length} positions found
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Filters */}
            <div className="mb-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={titleFilter}
                    onChange={(e) => setTitleFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm placeholder-gray-400"
                  />
                </div>

                {/* Grade Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by grade..."
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm placeholder-gray-400"
                  />
                </div>
              </div>
              
              {/* Additional filters for Solution and Demanded For */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Solution Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by solution..."
                    value={solutionFilter}
                    onChange={(e) => setSolutionFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm placeholder-gray-400"
                  />
                </div>

                {/* Demanded For Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by client/demanded for..."
                    value={demandedForFilter}
                    onChange={(e) => setDemandedForFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-sm placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Solution</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Demanded For</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Hiring Manager</div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Urgency</div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-100">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.grade}</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.functionType || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{job.demandedFor || 'N/A'}</div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        job.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{job.hiringManager}</div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.hiringUrgency?.toLowerCase().includes('high') ? 'bg-red-100 text-red-800' :
                        job.hiringUrgency?.toLowerCase().includes('normal') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.hiringUrgency || 'N/A'}
                      </span>
                    </div>
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

export default AllPositionsModal; 