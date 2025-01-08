import React, { useState, useEffect } from 'react';
import { Mail, Briefcase, Calendar, Clock, User, ChevronDown, Lock } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [stageResults, setStageResults] = useState({});
  const [activeStage, setActiveStage] = useState('HR');
  const [showOnboardButton, setShowOnboardButton] = useState(false);

  // Map stage names to their corresponding interview types
  const stageToType = {
    'HR': 'HR',
    'TECHNICAL': 'Technical',
    'CULTURAL': 'Cultural',
    'FINAL': 'Final'
  };

  // Stage order mapping (for progression check)
  const stageOrder = ['HR', 'TECHNICAL', 'CULTURAL', 'FINAL'];

  // Icons for each stage
  const stageIcons = {
    'HR': <User className="w-5 h-5" />,
    'TECHNICAL': <></>,
    'CULTURAL': <User className="w-5 h-5" />,
    'FINAL': <Lock className="w-5 h-5" />,
    'ONBOARDING': <Briefcase className="w-5 h-5" />
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

  // Handle onboard button click
  const handleOnboard = async () => {
    await checkAndCreateEmployee();
    setShowOnboardButton(false);
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

  // Check if all stages are passed and create employee if so
  const checkAndCreateEmployee = async () => {
    if (!selectedApplicant?.interviews) return;

    try {
      // Update applicant status to 'hired'
      await axios.put(`http://localhost:5000/api/applicant/${selectedApplicant.id}`, {
        status: 'hired'
      });

      // Get the function type from the job or use default
      const department = selectedApplicant.job?.functionType || 'Data Transformation';
      
      // Combine job title and grade for the role if available
      const jobTitle = selectedApplicant.job?.title || '';
      const jobGrade = selectedApplicant.job?.grade || 'Analyst';
      const role = jobTitle ? `${jobTitle} - ${jobGrade}` : jobGrade;
      
      // Create new employee with all necessary information
      const employeeData = {
        name: selectedApplicant.name,
        email: selectedApplicant.email,
        phone: selectedApplicant.phone,
        department,
        role,
        status: 'active',
        applicantId: selectedApplicant.id,
        isOnboarding: true
      };

      console.log('Creating employee with data:', employeeData);
      const response = await axios.post('http://localhost:5000/api/employees', employeeData);

      // Navigate to onboarding checklist
      navigate(`/onboarding/${response.data.id}`);
    } catch (error) {
      console.error('Error creating employee:', error);
      console.error('Error response:', error.response?.data);
    }
  };

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
                {selectedApplicant.position || 'Position Not Specified'}
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
          const StageIcon = stage.icon;
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
              <div className={`
                h-16 flex items-center justify-center
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
                  <StageIcon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium whitespace-nowrap">{stage.name}</span>
                </div>
              </div>
            </div>
          );
        })}
        {isFinalRoundPassed() && (
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
          </div>
        )}
      </div>

      <style jsx>{`
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
      `}</style>

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
                  setSelectedStage(activeStage);
                  setShowScheduler(true);
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Schedule {activeStage} Interview
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
                          stageResults[interview.id] && stageResults[interview.id].result === 'pass'
                            ? 'bg-green-200 text-green-800'
                            : stageResults[interview.id] && stageResults[interview.id].result === 'fail'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {stageResults[interview.id] && stageResults[interview.id].result ? stageResults[interview.id].result.charAt(0).toUpperCase() + stageResults[interview.id].result.slice(1) : 'Pending'}
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
                        setSelectedInterview(interview);
                        setShowResultModal(true);
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
    </div>
  );
};

export default InterviewRightSidebar;
