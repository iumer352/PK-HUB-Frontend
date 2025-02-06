import React, { useState, useEffect } from 'react';
import { Mail, Briefcase, Calendar, Clock, User, ChevronDown, Lock, Code, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HRResultModal from './modals/HRResultModal';
import OfferLetterModal from './modals/OfferLetterModal';

const InterviewRightSidebar = ({ 
  selectedApplicant,
  jobDetails,
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
  setShowNotes,
  interviewQuestions
}) => {
  const navigate = useNavigate();
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [stageResults, setStageResults] = useState({});
  const [activeStage, setActiveStage] = useState('HR');
  const [showOnboardButton, setShowOnboardButton] = useState(false);
  const [onboardingSuccess, setOnboardingSuccess] = useState(false);
  const [showHRModal, setShowHRModal] = useState(false);
  const [selectedHRInterview, setSelectedHRInterview] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerStatus, setOfferStatus] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);

  // Debug log for job details and interview questions
  useEffect(() => {
    console.log('Job Details and Interview Questions in Right Sidebar:', {
      jobDetails,
      selectedApplicant,
      interviewQuestions
    });
  }, [jobDetails, selectedApplicant, interviewQuestions]);

  // Map stage names to their corresponding interview types
  const stageToType = {
    'HR': 'HR',
    'CULTURAL': 'Cultural',
    'TECHNICAL': 'Technical',
    'FINAL': 'Final',
    'OFFER': 'Offer'
  };

  // Stage order mapping (for progression check)
  const stageOrder = ['HR', 'CULTURAL', 'TECHNICAL', 'FINAL', 'OFFER'];

  // Map stage names to their corresponding icons
  const stageIcons = {
    'HR': User,
    'CULTURAL': ChevronDown,
    'TECHNICAL': Code,
    'FINAL': Lock,
    'OFFER': DollarSign
  };

  // Check if we can proceed to this stage
  const canProceedToStage = (stageId) => {
    const currentIndex = stageOrder.indexOf(stageId);
    if (currentIndex === 0) return true; // Can always do HR

    // Check all previous stages
    for (let i = 0; i < currentIndex; i++) {
      const prevStage = stageOrder[i];
      const prevInterview = selectedApplicant?.interviews?.find(interview => 
        interview.interviewer.interview_type === stageToType[prevStage]
      );
      const prevResult = stageResults[prevInterview?.id]?.result;
      
      if (prevResult !== 'pass') {
        return false; // Can't proceed if any previous stage isn't passed
      }
    }
    return true;
  };

  // Check if final round is passed
  const isFinalRoundPassed = () => {
    const finalInterview = selectedApplicant?.interviews?.find(interview => 
      interview.interviewer.interview_type === stageToType['FINAL']
    );
    return stageResults[finalInterview?.id]?.result === 'pass';
  };

  // Check if offer is accepted using the offer status from backend
  const isOfferAccepted = () => {
    return offerStatus === 'accepted';
  };

  // Fetch offer status whenever selected applicant changes
  useEffect(() => {
    const fetchOfferStatus = async () => {
      if (selectedApplicant?.id) {
        try {
          const response = await axios.get(`http://localhost:5000/api/applicant/${selectedApplicant.id}/offer-status`);
          setOfferStatus(response.data.offer_status);
        } catch (error) {
          console.error('Error fetching offer status:', error);
        }
      }
    };
    
    fetchOfferStatus();
  }, [selectedApplicant?.id]);

  // Handle onboard button click
  const handleOnboard = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/employees/', {
        name: selectedApplicant.name,
        email: selectedApplicant.email,
        phone: selectedApplicant.phone,
        department: jobDetails.functionType,
        jobTitle: jobDetails.title,
        grade: jobDetails.grade
      });

      if (response.status === 201) {
        setOnboardingSuccess(true);
        // Update applicant status to reflect onboarding completion
        await axios.patch(`http://localhost:5000/api/applicant/${selectedApplicant.id}/status`, {
          status: 'onboarded'
        });
      }
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  // Handle onboarding column click
  const handleOnboardingClick = () => {
    setShowOnboardButton(!showOnboardButton);
  };

  // Filter interviews based on active stage
  const filteredInterviews = selectedApplicant?.interviews?.filter(interview => {
    console.log('Interview type:', interview.interviewer.interview_type);
    console.log('Looking for type:', stageToType[activeStage]);
    return interview.interviewer.interview_type === stageToType[activeStage];
  }) || [];

  useEffect(() => {
    // Show onboard button only if offer is accepted and final round is passed
    const shouldShowOnboard = isFinalRoundPassed() && isOfferAccepted() && !onboardingSuccess;
    setShowOnboardButton(shouldShowOnboard);
  }, [selectedApplicant?.interviews, onboardingSuccess]);

  // Process interviews and update stage results
  useEffect(() => {
    if (!selectedApplicant?.interviews) return;

    console.log('Selected Applicant:', selectedApplicant);
    console.log('Interviews:', selectedApplicant.interviews);
    
    const newStageResults = {};
    let hasChanges = false;
    
    selectedApplicant.interviews.forEach((interview) => {
      if (!interview.stages || interview.stages.length === 0) {
        console.warn('No stages found for interview:', interview);
        return;
      }
      
      const stage = interview.stages[0];
      const currentResult = stageResults[interview.id]?.result;
      const newResult = stage.result || 'pending';
      
      if (currentResult !== newResult) {
        hasChanges = true;
      }
      
      newStageResults[interview.id] = {
        result: newResult,
        completed_at: stage.completed_at
      };
    });

    // Only update if there are actual changes
    if (hasChanges) {
      setStageResults(newStageResults);
    }
  }, [selectedApplicant]); // Only depend on selectedApplicant

  console.log('Current stageResults:', stageResults);

  // Get stage result (pass/fail/pending)
  const getStageResult = (stage) => {
    // For offer stage, check the offer status
    if (stage.id === 'OFFER') {
      return offerStatus === 'accepted' ? 'pass' : 
             offerStatus === 'rejected' ? 'fail' : 'pending';
    }

    // For other stages, check interview results
    const interview = selectedApplicant?.interviews?.find(interview => 
      interview.interviewer.interview_type === stageToType[stage.id]
    );
    return stageResults[interview?.id]?.result || 'pending';
  };

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
                Applied for: {jobDetails?.title || 'Position Not Available'}
              </p>
            </div>
          </div>
          <div className="relative mt-4">

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

      {/* Stage Progress */}
      <div className="flex mb-8">
        {INTERVIEW_STAGES.map((stage, index) => {
          const result = getStageResult(stage);
          const isCurrentStage = stage.id === activeStage;
          const canProceed = canProceedToStage(stage.id);
          
          return (
            <div 
              key={stage.id}
              className={`relative flex-1 ${canProceed ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              onClick={() => {
                if (canProceed) {
                  setActiveStage(stage.id);
                }
              }}
            >
              <div className={`h-16 flex items-center justify-center
                ${index === 0 ? 'rounded-l-lg' : ''}
                ${index === INTERVIEW_STAGES.length - 1 ? 'rounded-r-lg' : ''}
                relative
                ${result === 'pass'
                  ? 'bg-green-500 text-white' 
                  : result === 'fail'
                  ? 'bg-red-500 text-white'
                  : isCurrentStage && canProceed
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'}
                ${index < INTERVIEW_STAGES.length - 1 ? 'arrow-shape' : ''}
                transition-all duration-200
                ${canProceed ? 'hover:opacity-90' : ''}
              `}>
                <div className="flex flex-col items-center z-10 relative">
                  {React.createElement(stageIcons[stage.id], {
                    className: "w-4 h-4",
                    "aria-hidden": "true"
                  })}
                  <span className="text-xs font-medium whitespace-nowrap">{stage.name}</span>
                </div>
              </div>
            </div>
          );
        })}
        {isFinalRoundPassed() && isOfferAccepted() && (
          <div 
            className="flex flex-col items-center relative cursor-pointer"
            onClick={handleOnboardingClick}
          >
            <div className="p-3 rounded-full bg-green-100 hover:bg-green-200">
              <Briefcase className="w-6 h-6 mb-1" />
            </div>
            <span className="text-sm mt-2">Onboarding</span>
            {showOnboardButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent column click event
                  handleOnboard();
                }}
                className="absolute top-full mt-2 px-4 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Onboard
              </button>
            )}
            {onboardingSuccess && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                Applicant has been successfully onboarded!
              </div>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          .arrow-shape::after {
            content: '';
            position: absolute;
            right: -15px;
            top: 0;
            bottom: 0;
            width: 30px;
            background: inherit;
            clip-path: polygon(0 0, 0 100%, 50% 50%);
            z-index: 1;
          }
          .arrow-shape::before {
            content: '';
            position: absolute;
            right: -15px;
            top: 0;
            bottom: 0;
            width: 30px;
            background: inherit;
            clip-path: polygon(100% 0, 0 50%, 100% 100%);
            z-index: 2;
          }
        `}
      </style>

      {/* Interview Timeline */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {activeStage} Interview Timeline
        </h3>
        <div className="space-y-6">
          {!canProceedToStage(activeStage) ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Complete previous stages to unlock {activeStage} round</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No {activeStage} interviews scheduled yet</p>
              <button
                onClick={() => {
                  if (activeStage === 'OFFER') {
                    setShowOfferModal(true);
                  } else {
                    setSelectedStage(activeStage);
                    setShowScheduler(true);
                  }
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {activeStage === 'OFFER' ? 'Update Offer Status' : `Schedule ${activeStage} Interview`}
              </button>
            </div>
          ) : (
            filteredInterviews.map((interview) => (
              <div
                key={interview.id}
                className={`rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 ${
                  stageResults[interview.id] && stageResults[interview.id].result === 'pass'
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : stageResults[interview.id] && stageResults[interview.id].result === 'fail'
                    ? 'bg-red-50 border-l-4 border-red-500'
                    : 'bg-blue-50 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    {/* Interview Type and Status */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {interview.interviewer.interview_type} Interview
                        <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                          interview.interviewer.interview_type === 'Offer' && offerStatus === 'accepted'
                            ? 'bg-green-200 text-green-800'
                            : interview.interviewer.interview_type === 'Offer' && offerStatus === 'rejected'
                            ? 'bg-red-200 text-red-800'
                            : stageResults[interview.id] && stageResults[interview.id].result === 'pass'
                            ? 'bg-green-200 text-green-800'
                            : stageResults[interview.id] && stageResults[interview.id].result === 'fail'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {interview.interviewer.interview_type === 'Offer'
                            ? offerStatus === 'accepted'
                              ? 'Offer Accepted'
                              : offerStatus === 'rejected'
                              ? 'Offer Rejected'
                              : 'Pending'
                            : stageResults[interview.id] && stageResults[interview.id].result 
                              ? stageResults[interview.id].result.charAt(0).toUpperCase() + stageResults[interview.id].result.slice(1) 
                              : 'Pending'}
                        </span>
                      </h3>
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
                        if (interview.interviewer.interview_type === 'HR') {
                          setSelectedHRInterview(interview);
                          setShowHRModal(true);
                        } else {
                          setSelectedInterview(interview);
                          setShowResultModal(true);
                        }
                      }}
                      className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                        stageResults[interview.id] && stageResults[interview.id].result === 'pass'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : stageResults[interview.id] && stageResults[interview.id].result === 'fail'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Update Result
                    </button>

                    {/* Show Proceed button if interview is passed and not the final stage */}
                    {stageResults[interview.id]?.result === 'pass' && 
                     stageOrder.indexOf(activeStage) < stageOrder.length - 1 && (
                      <button
                        onClick={() => {
                          const currentStageIndex = stageOrder.indexOf(activeStage);
                          const nextStage = stageOrder[currentStageIndex + 1];
                          if (nextStage) {
                            setActiveStage(nextStage);
                            // Open scheduler for next stage
                            setSelectedStage(nextStage);
                            setShowScheduler(true);
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Schedule {stageOrder[stageOrder.indexOf(activeStage) + 1]} Interview
                      </button>
                    )}

                    {/* Show Onboard button if this is the final stage and it's passed */}
                    {stageResults[interview.id]?.result === 'pass' && 
                     activeStage === stageOrder[stageOrder.length - 1] && (
                      <button
                        onClick={handleOnboard}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Proceed to Onboarding
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Interview Questions Section (Beta) */}
      {interviewQuestions && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <button 
            onClick={() => setShowQuestions(!showQuestions)}
            className="w-full flex items-center justify-between mb-4 focus:outline-none"
          >
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                AI Suggested Interview Questions
              </h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                Beta
              </span>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                showQuestions ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showQuestions && (
            <div className="space-y-4 mt-4">
              {(() => {
                let questions = [];
                switch(activeStage) {
                  case 'HR':
                    questions = interviewQuestions?.HR_Round || [];
                    break;
                  case 'CULTURAL':
                    questions = interviewQuestions?.Cultural_Round || [];
                    break;
                  case 'TECHNICAL':
                    questions = interviewQuestions?.Technical_Round || [];
                    break;
                  case 'FINAL':
                    questions = interviewQuestions?.Final_Round || [];
                    break;
                  default:
                    questions = [];
                }

                return questions.length > 0 ? (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No suggested questions available for this stage</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* HR Result Modal */}
      <HRResultModal
        isOpen={showHRModal}
        interview={selectedHRInterview}
        stageId={1} // HR stage ID is always 1
        applicantId={selectedApplicant?.id}
        onClose={() => {
          setShowHRModal(false);
          window.location.reload(); // Refresh to show updated data
        }}
      />

      {/* Offer Letter Modal */}
      <OfferLetterModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSchedule={async (resultData) => {
          try {
            // Find the offer stage interview
            const offerInterview = selectedApplicant?.interviews?.find(interview => 
              interview.interviewer.interview_type === stageToType['OFFER']
            );

            if (offerInterview) {
              const response = await axios.post(
                `http://localhost:5000/api/interview/stages/${offerInterview.id}/${offerInterview.stage_id}/feedback`,
                {
                  result: resultData.result,
                  feedback: `Offer ${resultData.offerStatus}`,
                  notes: `Offer status updated to: ${resultData.offerStatus}`
                }
              );

              // Update the stage results
              setStageResults(prev => ({
                ...prev,
                [offerInterview.id]: response.data
              }));
            }

            setShowOfferModal(false);
          } catch (error) {
            console.error('Error updating offer status:', error);
          }
        }}
        applicantId={selectedApplicant?.id}
      />
    </div>
  );
};

export default InterviewRightSidebar;
