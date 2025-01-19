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
  }, [selectedApplicant]); // Re-run when selectedApplicant changes, not just ID

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

          {/* Interview Rounds Feedback */}
          <div className="space-y-4">
            {INTERVIEW_STAGES.map((stage, index) => {
              // Map stage IDs to numbers
              const stageIdMap = { 'HR': 1, 'TECHNICAL': 2, 'CULTURAL': 3, 'FINAL': 4 };
              const numericStageId = stageIdMap[stage.id];
              
              const interview = applicant.interviews.find(i => 
                i.stages && i.stages.length > 0 && i.stages[0].stage_id === numericStageId
              );
              const feedback = interview ? stageFeedback[`${interview.id}-${numericStageId}`] : null;
              const status = getStageStatus(applicant.interviews, stage.id);

              console.log('Stage:', stage.name, 'NumericID:', numericStageId, 'Feedback:', feedback);

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

                  {feedback && (
                    <div className="mt-2 space-y-2">
                      {feedback.feedback && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Feedback:</span> {feedback.feedback}
                        </p>
                      )}
                      {feedback.notes && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {feedback.notes}
                        </p>
                      )}
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
