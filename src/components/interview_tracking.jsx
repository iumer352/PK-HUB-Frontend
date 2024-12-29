import React, { useState, useEffect } from 'react';
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

const INTERVIEW_STAGES = [
  { id: 'HR', name: 'HR Interview', color: 'blue', icon: UserCheck },
  { id: 'TECHNICAL', name: 'Technical Round', color: 'purple', icon: Code },
  { id: 'CULTURAL', name: 'Cultural Fit', color: 'green', icon: Users },
  { id: 'FINAL', name: 'Final Round', color: 'orange', icon: Award }
];


const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const InterviewResultModal = ({ interview, onClose, onSave }) => {
  const [result, setResult] = useState(interview?.result || 'pending');
  const [feedback, setFeedback] = useState(interview?.feedback || '');
  const [notes, setNotes] = useState(interview?.notes || '');

  const handleSave = () => {
    onSave({ result, feedback, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4">Update Interview Result</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
            <div className="flex space-x-4">
              {['pass', 'fail', 'pending'].map((option) => (
                <button
                  key={option}
                  onClick={() => setResult(option)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    result === option
                      ? option === 'pass'
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : option === 'fail'
                        ? 'bg-red-100 text-red-800 border-2 border-red-500'
                        : 'bg-gray-100 text-gray-800 border-2 border-gray-500'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter detailed feedback about the interview..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter any additional notes..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
};

const ScheduleInterviewModal = ({ isOpen, onClose, onSchedule, stageId, interviewers }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [interviewerId, setInterviewerId] = useState('');
  const stage = INTERVIEW_STAGES.find(s => s.id === stageId);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(stageId, date, time, interviewerId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule ${stage?.name || 'Interview'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Interviewer
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
            required
          >
            <option value="">Choose an interviewer</option>
            {interviewers.map(interviewer => (
              <option key={interviewer.id} value={interviewer.id}>
                {interviewer.name} - {interviewer.position}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            className="w-full p-2 border rounded-md"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
};

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
      const [applicantsRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/applicant'),
        axios.get('http://localhost:5000/api/employees')
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
      setInterviewers(employeesRes.data);
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
        response = await axios.post('http://localhost:5000/api/interview/schedule-stage', {
          applicant_id: selectedApplicant.id,
          interviewer_id: interviewerId,
          date_time: dateTime.toISOString(),
          stage_id: stageId
        });
      }
      
      // Update local state...
    } catch (error) {
      console.error('Error scheduling interview:', error);
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
      await axios.post(`/api/interview/stages/${interviewId}/feedback`, {
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
      {/* Left sidebar - Applicant List */}
      <div className="w-1/3 bg-white p-6 overflow-y-auto border-r border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Applicants</h2>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
            {applicants.length} Total
          </span>
        </div>
        <div className="space-y-4">
          {applicants.map((applicant) => {
            const currentStage = getCurrentStage(applicant.interviews);
            return (
              <div
                key={applicant.id}
                onClick={() => setSelectedApplicant(applicant)}
                className={`p-5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedApplicant?.id === applicant.id
                    ? 'bg-blue-50 border-blue-500 shadow-md'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                } border-2`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {applicant.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {applicant.position || 'Position Not Specified'}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    applicant.interviews.some(i => i.status === 'completed') 
                      ? 'bg-green-100 text-green-800'
                      : applicant.interviews.some(i => i.status === 'scheduled')
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {applicant.interviews.some(i => i.status === 'completed') 
                      ? 'In Progress'
                      : applicant.interviews.some(i => i.status === 'scheduled')
                      ? 'Interview Scheduled'
                      : 'New Applicant'}
                  </div>
                </div>
                
                {/* Interview Stage Progress */}
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                  {INTERVIEW_STAGES.map((stage, index) => {
                    const status = getStageStatus(applicant.interviews, stage.id);
                    const StageIcon = stage.icon;
                    const isCurrentStage = stage.id === currentStage;
                    
                    return (
                      <React.Fragment key={stage.id}>
                        <div className="flex flex-col items-center">
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              status === 'completed' 
                                ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                                : isCurrentStage 
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                                : 'bg-gray-200 text-gray-600'
                            } transition-all duration-200`}
                          >
                            <StageIcon className="w-6 h-6" />
                          </div>
                          <span className="text-xs mt-2 text-gray-600 font-medium">{stage.name}</span>
                        </div>
                        {index < INTERVIEW_STAGES.length - 1 && (
                          <ChevronRight 
                            className={`w-5 h-5 ${
                              status === 'completed' ? 'text-green-500' : 'text-gray-300'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {applicant.email}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side - Interview Details */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedApplicant ? (
          <>
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
                <button
                  onClick={() => {
                    const nextStage = INTERVIEW_STAGES.find(stage => 
                      !selectedApplicant.interviews.some(i => i.type === stage.id)
                    );
                    if (nextStage) {
                      setSelectedStage(nextStage.id);
                      setShowScheduler(true);
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Schedule Next Interview
                </button>
              </div>
            </div>

            {/* Interview Stages Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {INTERVIEW_STAGES.map((stage, index) => {
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
                        <div className="flex space-x-2">
                          {status === 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedInterview(interview);
                                setShowResultModal(true);
                              }}
                              className="flex-1 text-center text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Update Result
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowNotes(true);
                            }}
                            className="flex-1 text-center text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            {interview.notes ? 'View Notes' : 'Add Notes'}
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
                    const StageIcon = INTERVIEW_STAGES.find(s => s.id === interview.type)?.icon || User;
                    return (
                      <div
                        key={interview.id}
                        className={`border-l-4 ${getStageColor(interview.type)} bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                interview.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-200' :
                                interview.status === 'scheduled' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' :
                                'bg-gray-200 text-gray-600'
                              }`}>
                                <StageIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                </span>
                                <h4 className="text-gray-800 font-medium mt-1">
                                  {INTERVIEW_STAGES.find(s => s.id === interview.type)?.name}
                                </h4>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
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
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowNotes(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            {interview.notes ? 'View Notes' : 'Add Notes'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg">Select an applicant to view interview details</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showScheduler && (
        <ScheduleInterviewModal
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleInterview}
          selectedStage={selectedStage}
          interviewers={interviewers}
        />
      )}

      {showResultModal && selectedInterview && (
        <InterviewResultModal
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
      <Modal
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        title="Interview Notes"
      >
        <div className="space-y-4">
          {selectedInterview && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Type
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={selectedInterview.type}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewer
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={interviewers.find(i => i.id === selectedInterview.interviewerId)?.name || 'Not assigned'}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded-md h-32"
                  placeholder="Enter interview notes..."
                  defaultValue={selectedInterview.notes}
                />
              </div>
              <button
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                onClick={() => handleUpdateNotes("Updated notes for the interview")}
              >
                Save Notes
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RecruitingDashboard;