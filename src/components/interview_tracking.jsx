import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import InterviewLeftSidebar from './InterviewLeftSidebar';
import InterviewRightSidebar from './InterviewRightSidebar';
import InterviewResultModal from './modals/InterviewResultModal';
import ScheduleInterviewModal from './modals/ScheduleInterviewModal';
import NotesModal from './modals/NotesModal';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  X, 
  Mail, 
  Briefcase,
  UserCheck,
  Code,
  Users,
  Award,
  ChevronRight,
  DollarSign
} from 'lucide-react';

export const INTERVIEW_STAGES = [
  { id: 'HR', name: 'HR round', color: 'blue', icon: UserCheck },
  { id: 'CULTURAL', name: 'Cultural Fit', color: 'green', icon: Users },
  { id: 'TECHNICAL', name: 'Technical Round', color: 'purple', icon: Code },
  { id: 'FINAL', name: 'Final Round', color: 'orange', icon: Award, allowMultiple: true },
  { id: 'OFFER', name: 'Offer', color: 'yellow', icon: DollarSign }
];

const RecruitingDashboard = () => {
  const { jobId, applicantId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const jobDetails = state?.jobDetails;
  const scoreDetails = state?.scoreDetails;

  // Debug log to verify job details and score
  useEffect(() => {
    console.log('Job Details in Interview Tracking:', jobDetails);
    
    if (scoreDetails) {
      console.log('Score Details in Interview Tracking:', {
        score: scoreDetails,
        evaluation: scoreDetails.Evaluation,
        recommendation: scoreDetails.Recommendation
      });
    }
  }, [state, jobDetails, scoreDetails]);

  const [applicants, setApplicants] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId, applicantId]);

  useEffect(() => {
    if (selectedApplicant?.resume) {
      try {
        const resumeData = JSON.parse(selectedApplicant.resume);
        const questions = resumeData?.score?.Interview_Questions;
        console.log('Parsed Interview Questions:', questions);
        setInterviewQuestions(questions);
      } catch (error) {
        console.error('Error parsing resume data for interview questions:', error);
        setInterviewQuestions(null);
      }
    }
  }, [selectedApplicant]);

  const fetchData = async () => {
    try {
      const [InterviewerRes] = await Promise.all([
        axios.get('http://localhost:5000/api/interviewers/')
      ]);

      if (applicantId) {
        // If we have an applicantId, fetch just that applicant
        const applicantRes = await axios.get(`http://localhost:5000/api/applicant/${applicantId}`);
        const interviewsRes = await axios.get(`http://localhost:5000/api/interview/applicant/${applicantId}`);
        console.log('Applicant data check:', applicantRes.data.resume);
        const applicantWithInterviews = {
          ...applicantRes.data,
          interviews: interviewsRes.data
        };
        console.log('Applicant data:', applicantWithInterviews);
        setApplicants([applicantWithInterviews]);
        setSelectedApplicant(applicantWithInterviews);
      } else if (jobId) {
        // If we have a jobId, fetch all applicants for that job
        const applicantsRes = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
        const applicantsWithInterviews = await Promise.all(
          applicantsRes.data.map(async (applicant) => {
            const interviewsRes = await axios.get(`http://localhost:5000/api/interview/applicant/${applicant.id}`);
            return {
              ...applicant,
              interviews: interviewsRes.data
            };
          })
        );
        setApplicants(applicantsWithInterviews);
      }

      setInterviewers(InterviewerRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  // Update selected applicant's data
  const updateSelectedApplicantData = async (applicant) => {
    if (!applicant) {
      setSelectedApplicant(null);
      return;
    }

    try {
      const interviewsRes = await axios.get(`http://localhost:5000/api/interview/applicant/${applicant.id}`);
      const updatedApplicant = {
        ...applicant,
        interviews: interviewsRes.data
      };
      setSelectedApplicant(updatedApplicant);
    } catch (error) {
      console.error('Error fetching applicant interviews:', error);
      setError('Failed to load applicant interviews');
    }
  };

  const handleSelectApplicant = (applicant) => {
    updateSelectedApplicantData(applicant);
  };

  const handleScheduleInterview = async (stageId, date, time, interviewerId) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      const stage = INTERVIEW_STAGES.find(s => s.id === stageId);
      
      // Check if this is a final round and if there are existing final round interviews
      if (stage.id === 'FINAL') {
        const finalInterviews = selectedApplicant.interviews.filter(
          interview => interview.stages?.[0]?.stage_id === 4
        );
        
        // Only allow maximum of 2 final interviews
        if (finalInterviews.length >= 2) {
          throw new Error('Maximum of 2 final round interviews are allowed');
        }
        
        // If there's one interview, it must be completed before scheduling second
        if (finalInterviews.length === 1 && 
            !['pass', 'fail'].includes(finalInterviews[0].stages?.[0]?.result)) {
          throw new Error('Please complete the first final round interview before scheduling another');
        }
      }

      const requestData = {
        applicant_id: selectedApplicant.id,
        interviewer_id: interviewerId,
        date_time: dateTime.toISOString(),
        stage_id: stageId,
        stage_name: stage.name
      };
      
      console.log('Scheduling interview with data:', requestData);
      
      const response = await axios.post('http://localhost:5000/api/interview/schedule-stage', requestData);
      
      // Get updated interview data
      const interviewsRes = await axios.get(`http://localhost:5000/api/interview/applicant/${selectedApplicant.id}`);
      
      // Update the applicants state with new interview data
      setApplicants(prev => prev.map(applicant => 
        applicant.id === selectedApplicant.id 
          ? { ...applicant, interviews: interviewsRes.data }
          : applicant
      ));

      // Also update selectedApplicant to reflect the changes immediately
      setSelectedApplicant(prev => ({
        ...prev,
        interviews: interviewsRes.data
      }));

      // Close the scheduler modal
      setShowScheduler(false);
      alert('Interview scheduled successfully!');
      
      return true;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      // Show more specific error message from the backend if available
      const errorMessage = error.response?.data?.message || error.message || 'Error scheduling interview. Please try again.';
      alert(errorMessage);
      return false;
    }
  };

  const handleUpdateNotes = async (notes) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/interview/${selectedInterview.id}/feedback`, {
        notes
      });

      // Update local state
      setApplicants(prev => prev.map(applicant => {
        if (applicant.id === selectedApplicant.id) {
          return {
            ...applicant,
            interviews: applicant.interviews.map(interview => 
              interview.id === selectedInterview.id ? response.data : interview
            )
          };
        }
        return applicant;
      }));

      setShowNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const [stages, setStages] = useState([]);

// Add this to fetchData
  const fetchStages = async () => {
    try {
      const stagesRes = await axios.get('/api/interview-stages');
      setStages(stagesRes.data);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const handleUpdateStatus = async (interviewId, status) => {
    try {
      await axios.patch(`/api/interview/${interviewId}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating interview status:', error);
    }
  };

  const handleUpdateResult = async (interviewId, resultData) => {
    try {
      // Save the result to backend
      await axios.post(`http://localhost:5000/api/interview/stages/${interviewId}/${resultData.stageId}/feedback`, {
        result: resultData.result,
        feedback: resultData.feedback,
        notes: resultData.notes
      });

      // Get updated interview data
      const [interviewsRes, feedbackRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/interview/applicant/${selectedApplicant.id}`),
        axios.get(`http://localhost:5000/api/interview/stages/${interviewId}/${resultData.stageId}/result`)
      ]);
      
      // Update the applicants state with new interview data
      setApplicants(prev => prev.map(applicant => 
        applicant.id === selectedApplicant.id 
          ? { ...applicant, interviews: interviewsRes.data }
          : applicant
      ));

      // Also update selectedApplicant to reflect the changes immediately
      setSelectedApplicant(prev => ({
        ...prev,
        interviews: interviewsRes.data
      }));

      // Update selectedInterview if it's currently open
      if (selectedInterview && selectedInterview.id === interviewId) {
        const updatedInterview = {
          ...interviewsRes.data.find(interview => interview.id === interviewId),
          feedback: feedbackRes.data
        };
        setSelectedInterview(updatedInterview);
      }

      alert('Interview result updated successfully!');
      setShowResultModal(false);
      return true;
    } catch (error) {
      alert('Error updating interview result. Please try again.');
      console.error('Error updating interview result:', error);
      return false;
    }
  };

  const getStageStatus = (interviews, stageId) => {
    const interview = interviews.find(i => i.type === stageId);
    if (!interview) return 'pending';
    return interview.status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stageId) => {
    const stage = INTERVIEW_STAGES.find(s => s.id === stageId);
    return {
      HR: 'border-blue-500 bg-blue-50',
      TECHNICAL: 'border-purple-500 bg-purple-50',
      CULTURAL: 'border-green-500 bg-green-50',
      FINAL: 'border-orange-500 bg-orange-50',
      OFFER: 'border-yellow-500 bg-yellow-50'
    }[stageId] || 'border-gray-500 bg-gray-50';
  };

  const getCurrentStage = (interviews) => {
    let currentStage = 'HR';
    for (const stage of INTERVIEW_STAGES) {
      const interview = interviews.find(i => i.type === stage.id);
      if (!interview || interview.status === 'pending') {
        return stage.id;
      }
      if (interview.status === 'scheduled') {
        return stage.id;
      }
      if (interview.status === 'completed') {
        currentStage = stage.id;
        continue;
      }
      break;
    }
    return currentStage;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 p-4">{error}</div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <InterviewLeftSidebar 
        applicants={applicants}
        selectedApplicant={selectedApplicant}
        setSelectedApplicant={handleSelectApplicant}
        getCurrentStage={getCurrentStage}
        getStageStatus={getStageStatus}
      />

      <InterviewRightSidebar
        selectedApplicant={selectedApplicant}
        jobDetails={jobDetails}
        INTERVIEW_STAGES={INTERVIEW_STAGES}
        getCurrentStage={getCurrentStage}
        getStageStatus={getStageStatus}
        getStageColor={getStageColor}
        getStatusColor={getStatusColor}
        interviewers={interviewers}
        setShowScheduler={setShowScheduler}
        setSelectedStage={setSelectedStage}
        setShowResultModal={setShowResultModal}
        setSelectedInterview={setSelectedInterview}
        setShowNotes={setShowNotes}
        interviewQuestions={interviewQuestions}
      />

      {/* Modals */}
      {showScheduler && (
        <ScheduleInterviewModal
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleInterview}
          stageId={selectedStage}
          interviewers={interviewers}
          jobDetails={jobDetails}
        />
      )}

      {showResultModal && selectedInterview && (
        <InterviewResultModal
          isOpen={showResultModal}
          interview={selectedInterview}
          onClose={() => {
            setShowResultModal(false);
            setSelectedInterview(null);
          }}
          onSave={async (resultData) => {
            console.log('Interview ID:', selectedInterview.id);
            console.log('Stage ID:', selectedInterview.stages[0].stage_id);
            const success = await handleUpdateResult(selectedInterview.id, { ...resultData, stageId: selectedInterview.stages[0].stage_id });
            if (success) {
              setShowResultModal(false);
              setSelectedInterview(null);
              // Refresh data after modal is closed
              fetchData();
            }
          }}
        />
      )}

      {/* Notes Modal */}
      {showNotes && selectedInterview && (
        <NotesModal
          isOpen={showNotes}
          onClose={() => setShowNotes(false)}
          interview={selectedInterview}
          interviewers={interviewers}
          onSave={handleUpdateNotes}
        />
      )}
    </div>
  );
};

export default RecruitingDashboard;