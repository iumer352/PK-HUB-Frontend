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
  const [offerStatus, setOfferStatus] = useState(null);
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

        // Fetch offer status if applicant is selected
        if (selectedApplicant?.id) {
          try {
            const response = await axios.get(
              `http://localhost:5000/api/applicant/${selectedApplicant.id}/offer-status`
            );
            if (isMounted) {
              setOfferStatus(response.data.offer_status);
            }
          } catch (error) {
            console.error('Error fetching offer status:', error);
          }
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

  const getOfferStatusColor = (status) => {
    switch(status) {
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatSalary = (salary) => {
    return salary ? `${Number(salary).toLocaleString()} SAR` : 'Not specified';
  };

  return (
    <div className="w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Interview Progress</h2>
      </div>

      {applicantsToShow.map((applicant) => (
        <div key={applicant.id}>

          {/* Interview Rounds */}
          <div className="space-y-4">
            {INTERVIEW_STAGES.map((stage, index) => {
              const stageIdMap = { 'HR': 1, 'TECHNICAL': 2, 'CULTURAL': 3, 'FINAL': 4, 'OFFER': 5 };
              const numericStageId = stageIdMap[stage.id];
              
              const interview = applicant.interviews.find(i => 
                i.stages && i.stages.length > 0 && i.stages[0].stage_id === numericStageId
              );
              const feedback = interview ? stageFeedback[`${interview.id}-${numericStageId}`] : null;
              const status = getStageStatus(applicant.interviews, stage.id);
              const isHRStage = stage.id === 'HR';
              const isOfferStage = stage.id === 'OFFER';

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

                  {/* Offer Stage Details */}
                  {isOfferStage && offerStatus && (
                    <div className="mt-3 space-y-2 text-sm border-t border-gray-200 pt-3">
                      <div className={`px-3 py-2 rounded-lg ${getOfferStatusColor(offerStatus)}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Offer Status:</span>
                          <span className="font-medium">
                            {offerStatus.charAt(0).toUpperCase() + offerStatus.slice(1)}
                          </span>
                        </div>
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
