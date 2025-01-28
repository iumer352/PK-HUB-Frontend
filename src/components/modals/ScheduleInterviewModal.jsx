import React, { useState } from 'react';
import BaseModal from './BaseModal';

const ScheduleInterviewModal = ({ isOpen, onClose, onSchedule, stageId, interviewers, jobDetails }) => {
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');

  // Filter interviewers based on stage and job function for technical round
  const filteredInterviewers = interviewers.filter(interviewer => {
    const interviewType = interviewer.interview_type?.toUpperCase() || '';
    const stage = stageId?.toUpperCase() || '';
    
    // Base match on interview type
    const typeMatches = interviewType === stage;
    
    // For technical round, also check function match
    if (stage === 'TECHNICAL') {
      console.log('Technical round filtering:', {
        interviewer: interviewer.function,
        jobFunction: jobDetails?.functionType,
        matches: interviewer.function === jobDetails?.functionType
      });
      return typeMatches && interviewer.function === jobDetails?.functionType;
    }
    
    return typeMatches;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const time = `${hour}:${minute}`;
    const success = await onSchedule(stageId, date, time, selectedInterviewer);
    if (success) {
      onClose();
    }
  };

  // Generate time options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Schedule Interview">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                {hours.map(h => {
                  const displayHour = parseInt(h);
                  const period = displayHour >= 12 ? 'PM' : 'AM';
                  const display12Hour = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour;
                  return (
                    <option key={h} value={h}>
                      {display12Hour} {period}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                {minutes.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">24-hour format</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interviewer
          </label>
          <select
            value={selectedInterviewer}
            onChange={(e) => setSelectedInterviewer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select an interviewer</option>
            {filteredInterviewers.map((interviewer) => (
              <option key={interviewer.id} value={interviewer.id}>
                {interviewer.name} - {interviewer.position} ({interviewer.interview_type})
                {stageId === 'TECHNICAL' && ` - ${interviewer.function}`}
              </option>
            ))}
          </select>
          {filteredInterviewers.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              {stageId === 'TECHNICAL' 
                ? `No interviewers available for ${stageId} round with ${jobDetails?.functionType} function. Please contact HR to assign interviewers.`
                : `No interviewers available for ${stageId} round. Please contact HR to assign interviewers.`
              }
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={filteredInterviewers.length === 0}
          >
            Schedule Interview
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ScheduleInterviewModal;
