import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import InterviewResultModal from './modals/InterviewResultModal';
import ScheduleInterviewModal from './modals/ScheduleInterviewModal';
import NotesModal from './modals/NotesModal';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  UserCheck,
  Code,
  Users,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INTERVIEW_STAGES = [
  { id: 'HR', name: 'HR Interview', color: 'blue', icon: UserCheck },
  { id: 'TECHNICAL', name: 'Technical Round', color: 'purple', icon: Code },
  { id: 'CULTURAL', name: 'Cultural Fit', color: 'green', icon: Users },
  { id: 'FINAL', name: 'Final Round', color: 'orange', icon: Award }
];

const ApplicantInterviewTracking = () => {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const jobDetails = state?.jobDetails;

  // Debug log to verify job details
  useEffect(() => {
    console.log('Job Details in Interview Tracking:', {
      jobDetails,
      state
    });
  }, [state]);

  const [applicant, setApplicant] = useState(null);
  const [interviewers, setInterviewers] = useState([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [applicantId]);

  const fetchData = async () => {
    try {
      const [applicantRes, interviewerRes, interviewsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/applicant/${applicantId}`),
        axios.get('http://localhost:5000/api/interviewers/'),
        axios.get(`http://localhost:5000/api/interview/applicant/${applicantId}`)
      ]);

      setApplicant({
        ...applicantRes.data,
        interviews: interviewsRes.data
      });
      setInterviewers(interviewerRes.data);
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
      
      if (!applicant.interviews || applicant.interviews.length === 0) {
        response = await axios.post('http://localhost:5000/api/interview/schedule-first', {
          applicant_id: applicant.id,
          interviewer_id: interviewerId,
          date_time: dateTime.toISOString()
        });
      } else {
        const stage = INTERVIEW_STAGES.find(s => s.id === stageId);
        
        if (!stage) {
          throw new Error(`Stage not found with ID: ${stageId}`);
        }

        response = await axios.post('http://localhost:5000/api/interview/schedule-stage', {
          applicant_id: applicant.id,
          interviewer_id: interviewerId,
          date_time: dateTime.toISOString(),
          stage_id: stageId,
          stage_name: stage.name
        });
      }
      
      // Refresh interview data
      const interviewsRes = await axios.get(`http://localhost:5000/api/interview/applicant/${applicant.id}`);
      setApplicant(prev => ({
        ...prev,
        interviews: interviewsRes.data
      }));

      setShowScheduler(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const handleUpdateResult = async (interviewId, resultData) => {
    try {
      await axios.post(`http://localhost:5000/api/interview/stages/${interviewId}/feedback`, {
        result: resultData.result,
        feedback: resultData.feedback,
        notes: resultData.notes
      });
      fetchData();
    } catch (error) {
      console.error('Error updating interview result:', error);
    }
  };

  const handleUpdateNotes = async (notes) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/interview/${selectedInterview.id}/feedback`, {
        notes
      });

      setApplicant(prev => ({
        ...prev,
        interviews: prev.interviews.map(interview => 
          interview.id === selectedInterview.id ? response.data : interview
        )
      }));

      setShowNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const getStageStatus = (interviews, stageId) => {
    const interview = interviews?.find(i => i.type === stageId);
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 p-4">{error}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{applicant?.name}</h1>
            <p className="text-gray-600">{applicant?.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(applicant?.status)}`}>
              {applicant?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Interview Stages Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Interview Progress</h2>
        <div className="space-y-4">
          {INTERVIEW_STAGES.map((stage, index) => {
            const interview = applicant?.interviews?.find(i => i.type === stage.id);
            const status = getStageStatus(applicant?.interviews || [], stage.id);
            const StageIcon = stage.icon;

            return (
              <div key={stage.id} className="relative">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'scheduled' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <StageIcon className={`w-5 h-5 ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'scheduled' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{stage.name}</h3>
                        {interview && (
                          <p className="text-sm text-gray-500">
                            {new Date(interview.date_time).toLocaleDateString()} at{' '}
                            {new Date(interview.date_time).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedStage(stage.id);
                              setShowScheduler(true);
                            }}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Schedule
                          </button>
                        )}
                        {interview && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedInterview(interview);
                                setShowNotes(true);
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                              Notes
                            </button>
                            {status === 'scheduled' && (
                              <button
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setShowResultModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                Complete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {interview?.feedback && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{interview.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
                {index < INTERVIEW_STAGES.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>

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

export default ApplicantInterviewTracking;
