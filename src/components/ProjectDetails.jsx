import React from 'react';
import { Users, Calendar, ArrowLeft } from 'lucide-react';

const ProjectDetails = ({ 
  project, 
  employees, 
  onBack, 
  selectedEmployee,
  setSelectedEmployee,
  onAssignEmployee,
  getStatusColor,
  formatDate 
}) => {
  if (!project) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-16 bg-gradient-to-r from-blue-500 to-blue-600">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 text-white flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Projects
        </button>
      </div>
      
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Deadline</h3>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                {formatDate(project.deadline)}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Team Members</h3>
              <div className="space-y-2">
                {project.assignees && project.assignees.map(assignee => (
                  <div 
                    key={assignee.id}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 flex items-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {assignee.name}
                  </div>
                ))}
                {(!project.assignees || project.assignees.length === 0) && (
                  <div className="text-gray-500 italic">No team members assigned</div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Add Team Member</h3>
              <div className="flex gap-3">
                <select 
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">Select employee</option>
                  {employees
                    .filter(emp => !project.assignees?.some(assignee => assignee.id === emp.id))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))
                  }
                </select>
                <button 
                  onClick={() => onAssignEmployee(project.id, selectedEmployee)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
