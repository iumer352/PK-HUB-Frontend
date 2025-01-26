import React, { useState, useEffect } from 'react';
import { Calendar, Mail, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { INTERVIEW_STAGES } from './interview_tracking';
import axios from 'axios';

const InterviewLeftSidebar = ({ 
  applicants, 
  selectedApplicant, 
  setSelectedApplicant,
  getCurrentStage,
  getStageStatus 
}) => {
  const [stageFeedback, setStageFeedback] = useState({});
  const [hrData, setHrData] = useState(null);
  const applicantsToShow = selectedApplicant ? [selectedApplicant] : applicants;

  useEffect(() => {
    let isMounted = true;
    const fetchedInterviews = new Set();

    const fetchFeedback = async () => {
      if (selectedApplicant && selectedApplicant.interviews) {
        const feedbackData = {};
        for (const interview of selectedApplicant.interviews) {
          // Skip if we've already fetched this interview's feedback
          const key = `${interview.id}-${interview.stages?.[0]?.stage_id}`;
          if (fetchedInterviews.has(key) || !interview.stages?.[0]?.stage_id) continue;
          
          try {
            // For HR stage, fetch HR-specific data
            if (interview.stages[0].stage_id === 1) {
              const response = await axios.get(
                `http://localhost:5000/api/interview/stages/${interview.stages[0].stage_id}/applicant/${selectedApplicant.id}/hr-result`
              );
              if (isMounted) {
                setHrData(response.data);
              }
            }
            
            const response = await axios.get(
              `http://localhost:5000/api/interview/stages/${interview.id}/${interview.stages[0].stage_id}/result`
            );
            if (isMounted) {
              feedbackData[key] = response.data;
              fetchedInterviews.add(key);
            }
          } catch (error) {
            console.error('Error fetching feedback:', error);
          }
        }
        if (isMounted) {
          setStageFeedback(feedbackData);
        }
      }
    };

    fetchFeedback();

    return () => {
      isMounted = false;
    };
  }, [selectedApplicant]);

  const getResultIcon = (result) => {
    switch(result) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatSalary = (salary) => {
    return salary ? `${Number(salary).toLocaleString()} SAR` : 'Not specified';
  };

  return (
    <div className="w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Interview Progress</h2>
        {selectedApplicant && (
          <button 
            onClick={() => setSelectedApplicant(null)}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200"
          >
            Back to List
          </button>
        )}
      </div>

      {applicantsToShow.map((applicant) => (
        <div key={applicant.id}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{applicant.name}</h3>
            <p className="text-sm text-gray-600">{applicant.position || 'Position Not Specified'}</p>
          </div>

          {/* Interview Rounds */}
          <div className="space-y-4">
            {INTERVIEW_STAGES.map((stage, index) => {
              const stageIdMap = { 'HR': 1, 'TECHNICAL': 2, 'CULTURAL': 3, 'FINAL': 4 };
              const numericStageId = stageIdMap[stage.id];
              
              const interview = applicant.interviews.find(i => 
                i.stages && i.stages.length > 0 && i.stages[0].stage_id === numericStageId
              );
              const feedback = interview ? stageFeedback[`${interview.id}-${numericStageId}`] : null;
              const status = getStageStatus(applicant.interviews, stage.id);
              const isHRStage = stage.id === 'HR';

              return (
                <div 
                  key={stage.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    status === 'completed' 
                      ? 'border-l-green-500 bg-green-50' 
                      : status === 'current'
                      ? 'border-l-blue-500 bg-blue-50'
                      : 'border-l-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      {stage.name}
                      {feedback && (
                        <span className="ml-2">
                          {getResultIcon(feedback.result)}
                        </span>
                      )}
                    </h4>
                    {status === 'completed' && (
                      <span className="text-sm text-green-600 font-medium">Completed</span>
                    )}
                  </div>

                  {feedback && feedback.feedback && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Feedback:</span> {feedback.feedback}
                    </p>
                  )}

                  {/* HR Stage Details */}
                  {isHRStage && hrData && (
                    <div className="mt-3 space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span>Current Salary:</span>
                        <span className="font-medium">{formatSalary(hrData.current_salary)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Expected Salary:</span>
                        <span className="font-medium">{formatSalary(hrData.expected_salary)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notice Period:</span>
                        <span className="font-medium">{hrData.notice_period || 'Not specified'} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Willing to Relocate:</span>
                        <span className="font-medium">{hrData.willing_to_relocate ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Willing to Travel:</span>
                        <span className="font-medium">{hrData.willing_to_travel_saudi ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InterviewLeftSidebar;
