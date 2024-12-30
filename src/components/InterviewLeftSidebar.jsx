import React from 'react';
import { Calendar, Mail, ChevronRight } from 'lucide-react';
import { INTERVIEW_STAGES } from './interview_tracking';

const InterviewLeftSidebar = ({ 
  applicants, 
  selectedApplicant, 
  setSelectedApplicant,
  getCurrentStage,
  getStageStatus 
}) => {
  return (
    <div className="w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Applicants</h2>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
          {applicants.length} Total
        </span>
      </div>
      <div className="space-y-4">
        {applicants.map((applicant) => {
          const currentStage = getCurrentStage(applicant.interviews);
          return (
            <div
              key={applicant.id}
              onClick={() => setSelectedApplicant(applicant)}
              className={`p-5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedApplicant?.id === applicant.id
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } border-2`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {applicant.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {applicant.position || 'Position Not Specified'}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  applicant.interviews.some(i => i.status === 'completed') 
                    ? 'bg-green-100 text-green-800'
                    : applicant.interviews.some(i => i.status === 'scheduled')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {applicant.interviews.some(i => i.status === 'completed') 
                    ? 'In Progress'
                    : applicant.interviews.some(i => i.status === 'scheduled')
                    ? 'Interview Scheduled'
                    : 'New Applicant'}
                </div>
              </div>
              
              {/* Interview Stage Progress */}
              <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                {INTERVIEW_STAGES.map((stage, index) => {
                  const status = getStageStatus(applicant.interviews, stage.id);
                  const StageIcon = stage.icon;
                  const isCurrentStage = stage.id === currentStage;
                  
                  return (
                    <React.Fragment key={stage.id}>
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            status === 'completed' 
                              ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                              : isCurrentStage 
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                              : 'bg-gray-200 text-gray-600'
                          } transition-all duration-200`}
                        >
                          <StageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs mt-2 text-gray-600 font-medium">{stage.name}</span>
                      </div>
                      {index < INTERVIEW_STAGES.length - 1 && (
                        <ChevronRight 
                          className={`w-5 h-5 ${
                            status === 'completed' ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {applicant.email}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewLeftSidebar;
