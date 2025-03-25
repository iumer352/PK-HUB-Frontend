import React, { useState } from 'react';
import StatModal from './StatModal';
import { Bar } from 'react-chartjs-2';

const ProjectsModal = ({ show, onClose, projectStats, jobsData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter jobs based on search term
  const filteredJobs = Array.isArray(jobsData) ? jobsData.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.functionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.demandedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.hiringManager?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <StatModal show={show} onClose={onClose} title="Projects Overview">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800">Total Projects</h3>
            <p className="text-2xl font-bold text-blue-600">{projectStats?.total || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800">Active</h3>
            <p className="text-2xl font-bold text-green-600">{projectStats?.active || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-800">Completed</h3>
            <p className="text-2xl font-bold text-purple-600">{projectStats?.completed || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800">Upcoming</h3>
            <p className="text-2xl font-bold text-yellow-600">{projectStats?.upcoming || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Completed Projects',
                data: projectStats?.monthlyProgress || [2, 3, 4, 3, 5, 4],
                backgroundColor: 'rgba(79, 70, 229, 0.5)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { 
                legend: { position: 'top' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Current Projects</h3>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-600 uppercase">Project Name</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Solution</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Client</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Grade</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Status</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Manager</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Priority</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="grid grid-cols-7 gap-2 px-4 py-3 hover:bg-gray-100">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.functionType || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{job.demandedFor || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{job.grade}</div>
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
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  No projects found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StatModal>
  );
};

export default ProjectsModal; 