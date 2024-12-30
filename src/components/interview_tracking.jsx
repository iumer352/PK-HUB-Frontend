import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

export const INTERVIEW_STAGES = [
  { id: 'HR', name: 'HR Interview', color: 'blue', icon: UserCheck },
  { id: 'TECHNICAL', name: 'Technical Round', color: 'purple', icon: Code },
  { id: 'CULTURAL', name: 'Cultural Fit', color: 'green', icon: Users },
  { id: 'FINAL', name: 'Final Round', color: 'orange', icon: Award }
];

const RecruitingDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applicantsRes, InterviewerRes] = await Promise.all([
        axios.get('http://localhost:5000/api/applicant'),
        axios.get('http://localhost:5000/api/interviewers/')
      ]);

      console.log("applican res is ", applicantsRes)
      // Get interviews for each applicant
      const applicantsWithInterviews = await Promise.all(
        applicantsRes.data.map(async (applicant) => {
          try {
            const interviewsRes = await axios.get(`http://localhost:5000/api/interview/applicant/${applicant.id}`);
            return {
              ...applicant,
              interviews: interviewsRes.data
            };
          } catch (error) {
            console.error(`Error fetching interviews for applicant ${applicant.id}:`, error);
            return {
              ...applicant,
              interviews: []
            };
          }
        })
      );


      setApplicants(applicantsWithInterviews);
      setInterviewers(InterviewerRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (stageId, date, time, interviewerId) => {
    try {
      const dateTime = new Date(`${date}T${time}`);
      let response;
      
      // Check if this is the first interview for the applicant
      if (!selectedApplicant.interviews || selectedApplicant.interviews.length === 0) {
        response = await axios.post('http://localhost:5000/api/interview/schedule-first', {
          applicant_id: selectedApplicant.id,
          interviewer_id: interviewerId,
          date_time: dateTime.toISOString()
        });
      } else {
        // For subsequent interviews, use schedule-next or schedule-stage
        const stage = INTERVIEW_STAGES.find(s => s.id === stageId);
        console.log('Selected Stage:', stage);
        console.log('Stage ID:', stageId);
        console.log('Stage name:', stage?.name);
        console.log('INTERVIEW_STAGES:', INTERVIEW_STAGES);
        
        if (!stage) {
          throw new Error(`Stage not found with ID: ${stageId}`);
        }

        const requestData = {
          applicant_id: selectedApplicant.id,
          interviewer_id: interviewerId,
          date_time: dateTime.toISOString(),
          stage_id: stageId,         // e.g., "FINAL" - used for interviewer type validation
          stage_name: stage.name     // e.g., "Final Round" - used to find stage in database
        };
        console.log('Sending request data:', requestData);
        
        response = await axios.post('http://localhost:5000/api/interview/schedule-stage', requestData);
      }
      
      // Refresh interview data for the selected applicant
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
    } catch (error) {
      console.error('Error scheduling interview:', error.response?.data || error);
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
      console.log("result data is ",resultData.result)
      await axios.post(`http://localhost:5000/api/interview/stages/${interviewId}/feedback`, {
        result: resultData.result,
        feedback: resultData.feedback,
        notes: resultData.notes
      });
      // Refresh applicant data
      fetchData();
    } catch (error) {
      console.error('Error updating interview result:', error);
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
      FINAL: 'border-orange-500 bg-orange-50'
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
        setSelectedApplicant={setSelectedApplicant}
        getCurrentStage={getCurrentStage}
        getStageStatus={getStageStatus}
      />

      <InterviewRightSidebar
        selectedApplicant={selectedApplicant}
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
      />

      {/* Modals */}
      {showScheduler && (
        <ScheduleInterviewModal
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleInterview}
          stageId={selectedStage}
          interviewers={interviewers}
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
          onSave={(resultData) => {
            handleUpdateResult(selectedInterview.id, resultData);
            setShowResultModal(false);
            setSelectedInterview(null);
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