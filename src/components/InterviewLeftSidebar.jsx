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
  const [location, setLocation] = useState(null);
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
                `/api/interview/stages/${interview.stages[0].stage_id}/applicant/${selectedApplicant.id}/hr-result`
              );
              if (isMounted) {
                setHrData(response.data);
              }
            }
            
            const response = await axios.get(
              `/api/interview/stages/${interview.id}/${interview.stages[0].stage_id}/result`
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
              `/api/applicant/${selectedApplicant.id}/offer-status`
            );
            if (isMounted) {
              setOfferStatus(response.data.offer_status);
            }
          } catch (error) {
            console.error('Error fetching offer status:', error);
          }
        }
      }

      if (selectedApplicant?.id) {
        try {
          const response = await axios.get(
            `/api/applicant/${selectedApplicant.id}/`
          );
          if (isMounted) {
            setLocation(response.data.location);
          }
        } catch (error) {
          console.error('Error fetching offer status:', error);
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
    if (!salary) return 'Not specified';
  
    // Remove decimals (e.g., ".50") and keep rest of the string
    const cleaned = salary.replace(/(\d+)\.\d+/g, '$1');
  
    return cleaned.replace(/\d+/g, (num) => {
      return parseInt(num).toLocaleString();
    }) + ' PKR';
  };
  
  return (
    <div className="w-1/3 bg-white p-4 lg:p-3 xl:p-6 2xl:p-8 overflow-y-auto border-r border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6 lg:mb-4 xl:mb-8 2xl:mb-10">
        <h2 className="text-xl lg:text-base xl:text-3xl 2xl:text-4xl font-bold text-gray-800">
          Interview Progress
        </h2>
      </div>

      {applicantsToShow.map((applicant) => (
        <div key={applicant.id}>
          {/* Interview Rounds */}
          <div className="space-y-3 lg:space-y-2 xl:space-y-5 2xl:space-y-6">
            {INTERVIEW_STAGES.map((stage) => {
              const stageIdMap = { 'HR': 1, 'TECHNICAL': 3, 'CULTURAL': 2, 'FINAL': 4, 'OFFER': 5 };
              const numericStageId = stageIdMap[stage.id];
              
              // Get all interviews for this stage
              const stageInterviews = applicant.interviews?.filter(i => 
                i.stages && i.stages.length > 0 && i.stages[0].stage_id === numericStageId
              ) || [];

              const status = getStageStatus(applicant.interviews || [], stage.id);
              const isHRStage = stage.id === 'HR';
              const isOfferStage = stage.id === 'OFFER';
              const isFinalStage = stage.id === 'FINAL';

              return (
                <div key={stage.id} 
                  className={`p-3 lg:p-2 xl:p-5 2xl:p-6 rounded-lg border-l-4 ${
                    status === 'completed' 
                      ? 'border-l-green-500 bg-green-50' 
                      : status === 'current'
                      ? 'border-l-blue-500 bg-blue-50'
                      : 'border-l-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 lg:mb-1.5 xl:mb-3">
                    <h4 className="text-sm lg:text-xs xl:text-lg 2xl:text-xl font-medium text-gray-800">
                      {stage.name}
                    </h4>
                    {status === 'completed' && (
                      <span className="text-xs lg:text-[10px] xl:text-base 2xl:text-lg text-green-600 font-medium">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* For non-final stages, show interviewer and feedback */}
                  {!isFinalStage && stageInterviews.map((interview) => {
                    const interviewKey = `${interview.id}-${interview.stages[0].stage_id}`;
                    const feedback = stageFeedback[interviewKey];
                    
                    return (
                      <div key={interview.id} className="space-y-2 lg:space-y-1.5 mt-2 lg:mt-1.5 xl:mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs lg:text-[10px] xl:text-base 2xl:text-lg text-gray-600">
                            Interviewer: {interview.interviewer.name}
                          </span>
                          <span className="w-5 lg:w-4 xl:w-7 2xl:w-8 h-5 lg:h-4 xl:h-7 2xl:h-8">
                            {getResultIcon(feedback?.result)}
                          </span>
                        </div>

                        {feedback?.feedback && (
                          <div className="text-xs lg:text-[10px] xl:text-base 2xl:text-lg text-gray-600">
                            <span className="font-medium">Feedback: </span>
                            {feedback.feedback}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* For Final Stage, keep the original detailed format */}
                  {isFinalStage && (
                    <>
                      {stageInterviews.length > 0 && (
                        <div className="space-y-4">
                          {stageInterviews.map((interview, index) => {
                            const interviewKey = `${interview.id}-${interview.stages[0].stage_id}`;
                            const feedback = stageFeedback[interviewKey];
                            
                            return (
                              <div key={interview.id} 
                                className={`p-3 rounded-lg ${
                                  feedback?.result === 'pass' 
                                    ? 'bg-green-50' 
                                    : feedback?.result === 'fail'
                                    ? 'bg-red-50'
                                    : 'bg-white'
                                } border border-gray-200 mt-2`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600">
                                    Interviewer: {interview.interviewer.name}
                                  </span>
                                  <span className="ml-2">
                                    {getResultIcon(feedback?.result)}
                                  </span>
                                </div>

                                {feedback?.feedback && (
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">Feedback: </span>
                                    {feedback.feedback}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Keep HR and Offer stage details */}
                  {isHRStage && hrData && (
                    <div className="mt-3 lg:mt-2 xl:mt-3 space-y-2 lg:space-y-1.5 xl:space-y-2 
                                  text-xs lg:text-[10px] xl:text-base 2xl:text-lg text-gray-600 
                                  border-t border-gray-200 pt-3 lg:pt-2 xl:pt-3">
                      <div className="flex items-center justify-between">
                        <span>Based In:</span>
                        <span className="font-medium">{location}</span>
                      </div>
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

                  {/* Offer Status - Only show in offer stage when accepted or rejected */}
                  {isOfferStage && offerStatus && (offerStatus === 'accepted' || offerStatus === 'rejected') && (
                    <div className={`mt-3 lg:mt-2 xl:mt-3 px-3 lg:px-2 xl:px-3 py-2 lg:py-1.5 xl:py-2 rounded-lg ${getOfferStatusColor(offerStatus)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Offer Status:</span>
                        <span className="font-medium">
                          {offerStatus.charAt(0).toUpperCase() + offerStatus.slice(1)}
                        </span>
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
