import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Users } from 'lucide-react';
import axios from 'axios';

const ProjectsModal = ({ isOpen, onClose }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs');
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusColor = (jobStatus) => {
    switch (jobStatus?.toLowerCase()) {
      case 'advertisement':
        return 'bg-blue-100 text-blue-800';
      case 'in hr round':
        return 'bg-indigo-100 text-indigo-800';
      case 'in cultural round':
        return 'bg-purple-100 text-purple-800';
      case 'in technical round':
        return 'bg-violet-100 text-violet-800';
      case 'in final round':
        return 'bg-fuchsia-100 text-fuchsia-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Active Projects</h3>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.hiringUrgency === 'Urgent - Immediate Hire'
                              ? 'bg-red-100 text-red-800'
                              : job.hiringUrgency === 'High Priority'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {job.hiringUrgency}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(job.jobStatus)
                          }`}>
                            <Users className="w-3 h-3 mr-1" />
                            {job.jobStatus || 'Advertisement'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsModal; 