import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, BarChart2 } from 'lucide-react';
import axios from 'axios';
import StatModal from './StatModal';

const OpenPositionsModal = ({ show, onClose, selectedSolution }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('positions'); // 'positions', 'lifecycle', or 'completed'

  useEffect(() => {
    const fetchJobs = async () => {
      if (!show) return;
      
      setLoading(true);
      try {
        const response = await axios.get('/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
      setLoading(false);
    };

    fetchJobs();
  }, [show]);

  // Filter jobs based on search term and selected solution for positions tab
  const filteredJobs = jobs.filter(job => 
    job.status === 'Active' && 
    (selectedSolution === 'all' || job.functionType === selectedSolution) &&
    (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.functionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.demandedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.hiringUrgency?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Filter completed jobs
  const completedJobs = jobs.filter(job => 
    job.jobStatus === 'Completed' &&
    (selectedSolution === 'all' || job.functionType === selectedSolution) &&
    (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.functionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.demandedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.hiringUrgency?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Process data for lifecycle tab
  const lifecycleData = React.useMemo(() => {
    const solutionMap = {};
    
    jobs.forEach(job => {
      const solution = job.functionType || 'Uncategorized';
      
      if (!solutionMap[solution]) {
        solutionMap[solution] = {
          total: 0,
          active: 0,
          completed: 0,
          inProgress: 0
        };
      }
      
      solutionMap[solution].total += 1;
      
      if (job.status === 'Active') {
        solutionMap[solution].active += 1;
        
        // Check if the job is completed
        if (job.jobStatus === 'Completed') {
          solutionMap[solution].completed += 1;
        } else {
          // If active but not completed, it's in progress
          solutionMap[solution].inProgress += 1;
        }
      }
    });
    
    return Object.entries(solutionMap).map(([solution, stats]) => ({
      solution,
      ...stats
    }));
  }, [jobs]);

  return (
    <StatModal
      show={show}
      onClose={onClose}
      title={activeTab === 'positions' 
        ? `Open Positions ${selectedSolution !== 'all' ? `- ${selectedSolution}` : ''}` 
        : activeTab === 'completed'
        ? 'Completed Positions'
        : 'Jobs Lifecycle'
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'positions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('positions')}
          >
            Open Positions
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'lifecycle'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('lifecycle')}
          >
            Jobs Lifecycle
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed Positions
          </button>
        </div>
        
        {activeTab === 'positions' ? (
          <>
            {/* Search bar - only for positions tab */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-sm placeholder-gray-400"
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No open positions found {searchTerm ? `matching "${searchTerm}"` : selectedSolution !== 'all' ? `for ${selectedSolution}` : ''}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg p-5 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Job Title and Grade */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{job.grade}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/joblisting/${job.id}`);
                            onClose();
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          View Details
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      {/* All job details in a single row */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Solution:</span>
                          <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{job.functionType || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Demanded For:</span>
                          <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{job.demandedFor || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Urgency:</span>
                          <span className={`font-medium px-2 py-0.5 rounded ${
                            job.hiringUrgency === 'Urgent - Immediate Hire'
                              ? 'bg-red-50 text-red-700'
                              : job.hiringUrgency === 'High Priority'
                              ? 'bg-orange-50 text-orange-700'
                              : job.hiringUrgency === 'Normal'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {job.hiringUrgency}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Job Stage:</span>
                          <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{job.jobStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'completed' ? (
          <>
            {/* Search bar for completed positions */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search completed positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-sm placeholder-gray-400"
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : completedJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No completed positions found {searchTerm ? `matching "${searchTerm}"` : selectedSolution !== 'all' ? `for ${selectedSolution}` : ''}
              </div>
            ) : (
              <div className="grid gap-4">
                {completedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg p-5 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Job Title and Grade */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{job.grade}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/joblisting/${job.id}`);
                            onClose();
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          View Details
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      {/* All job details in a single row */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Solution:</span>
                          <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{job.functionType || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Demanded For:</span>
                          <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{job.demandedFor || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Urgency:</span>
                          <span className={`font-medium px-2 py-0.5 rounded ${
                            job.hiringUrgency === 'Urgent - Immediate Hire'
                              ? 'bg-red-50 text-red-700'
                              : job.hiringUrgency === 'High Priority'
                              ? 'bg-orange-50 text-orange-700'
                              : job.hiringUrgency === 'Normal'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {job.hiringUrgency}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Completion Date:</span>
                          <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {new Date(job.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Jobs Lifecycle Tab
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-blue-800">Total Jobs</h3>
                <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-green-800">Active</h3>
                <p className="text-2xl font-bold text-green-600">
                  {jobs.filter(job => job.status === 'Active').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-purple-800">Completed</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {jobs.filter(job => job.jobStatus === 'Completed').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-yellow-800">In Progress</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {jobs.filter(job => job.status === 'Active' && job.jobStatus !== 'Completed').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-100 border-b border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase">Solution</div>
                <div className="text-xs font-semibold text-gray-600 uppercase text-center">Total Jobs</div>
                <div className="text-xs font-semibold text-gray-600 uppercase text-center">Active</div>
                <div className="text-xs font-semibold text-gray-600 uppercase text-center">Completed</div>
                <div className="text-xs font-semibold text-gray-600 uppercase text-center">In Progress</div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {lifecycleData.map((item) => (
                  <div key={item.solution} className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50">
                    <div className="text-sm font-medium text-gray-900">{item.solution}</div>
                    <div className="text-sm text-gray-600 text-center">{item.total}</div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.active}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.completed}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {item.inProgress}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StatModal>
  );
};

export default OpenPositionsModal; 