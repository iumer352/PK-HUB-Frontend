import React, { useState } from 'react';
import { Mail, Briefcase, Calendar, Clock, User, ChevronDown } from 'lucide-react';

const InterviewRightSidebar = ({ 
  selectedApplicant,
  INTERVIEW_STAGES,
  getCurrentStage,
  getStageStatus,
  getStageColor,
  getStatusColor,
  interviewers,
  setShowScheduler,
  setSelectedStage,
  setShowResultModal,
  setSelectedInterview,
  setShowNotes
}) => {
  const [showStageDropdown, setShowStageDropdown] = useState(false);

  if (!selectedApplicant) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-gray-500">
        Select an applicant to view details
      </div>
    );
  }

  // Get available stages (stages that haven't been completed or scheduled)
  const availableStages = INTERVIEW_STAGES.filter(stage => 
    !selectedApplicant.interviews.some(interview => 
      interview.interviewer.interview_type === stage.name.split(' ')[0]
    )
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedApplicant.name}
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {selectedApplicant.email}
              </p>
              <p className="text-gray-600 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                {selectedApplicant.position || 'Position Not Specified'}
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <button
              onClick={() => {
                if (availableStages.length === 0) return;
                setShowStageDropdown(!showStageDropdown);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-colors ${
                availableStages.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {selectedApplicant.interviews.length === 0 ? 'Schedule First Interview' : 'Schedule Next Interview'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showStageDropdown ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Stage Selection Dropdown */}
            {showStageDropdown && availableStages.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {availableStages.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => {
                      setSelectedStage(stage.id);
                      setShowScheduler(true);
                      setShowStageDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${getStageColor(stage.id)}`} />
                    <span>{stage.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Stages Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {INTERVIEW_STAGES.map((stage) => {
          const interview = selectedApplicant.interviews.find(i => i.type === stage.id);
          const status = getStageStatus(selectedApplicant.interviews, stage.id);
          const StageIcon = stage.icon;
          const isCurrentStage = stage.id === getCurrentStage(selectedApplicant.interviews);

          return (
            <div
              key={stage.id}
              className={`p-5 rounded-xl border-2 ${getStageColor(stage.id)} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-200' :
                    isCurrentStage ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    <StageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      {interview?.result && interview.result !== 'pending' && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          interview.result === 'pass' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {interview.result.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {interview && (
                <div className="mt-4 space-y-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(interview.dateTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(interview.dateTime).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {interviewers.find(i => i.id === interview.interviewerId)?.name || 'Interviewer not found'}
                  </div>
                  {interview.feedback && (
                    <div className="bg-white p-2 rounded-lg">
                      <p className="font-medium text-gray-800 mb-1">Feedback</p>
                      <p className="text-gray-600">{interview.feedback}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedInterview(interview);
                        setShowResultModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Update Result
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interview Timeline */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Interview Timeline</h3>
        <div className="space-y-6">
          {selectedApplicant.interviews.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No interviews scheduled yet</p>
              <button
                onClick={() => {
                  setSelectedStage('HR');
                  setShowScheduler(true);
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Schedule First Interview
              </button>
            </div>
          ) : (
            selectedApplicant.interviews.map((interview) => {
              return (
                <div
                  key={interview.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      {/* Interview Type and Status */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {interview.interviewer.interview_type} Interview
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          interview.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : interview.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status}
                        </span>
                      </div>

                      {/* Interview Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(interview.date_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(interview.date_time).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-700">{interview.interviewer.name}</span>
                          <span className="text-gray-400 mx-2">•</span>
                          <span>{interview.interviewer.position}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setSelectedInterview(interview);
                          setShowNotes(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {interview.notes ? 'View Notes' : 'Add Notes'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedInterview(interview);
                          setShowResultModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Update Result
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewRightSidebar;
