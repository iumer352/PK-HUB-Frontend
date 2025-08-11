import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

const ScheduleInterviewModal = ({ 
  isOpen, 
  onClose, 
  onSchedule,
  onUpdateInterview,
  stageId, 
  interviewers, 
  jobDetails,
  selectedInterview
}) => {
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');

  // Set default values when modal opens or selectedInterview changes
  useEffect(() => {
    if (isOpen) {
      if (selectedInterview) {
        // Use the pre-populated values from selectedInterview
        setDate(selectedInterview.currentDate || '');
        setHour(selectedInterview.currentHour || '09');
        setMinute(selectedInterview.currentMinute || '00');
        setSelectedInterviewer(selectedInterview.currentInterviewerId || '');
      } else {
        // Default to current date for new interviews
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        setDate(formattedDate);
      }
    }
  }, [isOpen, selectedInterview]);

  // Filter interviewers based on stage and job function for technical round
  const filteredInterviewers = interviewers.filter(interviewer => {
    const interviewType = interviewer.interview_type?.toUpperCase() || '';
    
    // Map stage names to numbers
    let stageNumber;
    if (typeof stageId === 'string') {
      switch(stageId.toUpperCase()) {
        case 'HR':
          stageNumber = 1;
          break;
        case 'CULTURAL':
          stageNumber = 2;
          break;
        case 'TECHNICAL':
          stageNumber = 3;
          break;
        case 'FINAL':
          stageNumber = 4;
          break;
        default:
          stageNumber = stageId;
      }
    } else {
      stageNumber = stageId;
    }
    
    // Map interviewer type to numbers for comparison
    let interviewTypeNumber;
    switch(interviewType) {
      case 'HR':
        interviewTypeNumber = 1;  // HR interviewer = 1
        break;
      case 'CULTURAL':
        interviewTypeNumber = 2;  // Cultural interviewer = 2
        break;
      case 'TECHNICAL':
        interviewTypeNumber = 3;  // Technical interviewer = 3
        break;
      case 'FINAL':
        interviewTypeNumber = 4;  // Final interviewer = 4
        break;
      default:
        interviewTypeNumber = 0;
    }

    // Function type matching for Technical and Cultural interviewers
    if (stageNumber === 2 || stageNumber === 3) { // Cultural or Technical round
      const interviewerFunction = interviewer.function?.toLowerCase();
      const jobFunction = jobDetails?.functionType?.toLowerCase();
      
      // For Cultural round, only check interview type
      if (stageNumber === 2) { // Cultural round
        return interviewTypeNumber === stageNumber && 
               interviewer.function === jobDetails?.functionType;
      }
      
      // For Technical round, check both interview type and function
      if (stageNumber === 3) { // Technical round
        return interviewTypeNumber === stageNumber && interviewerFunction === jobFunction;
      }
    }
    
    // For other rounds (HR, Final), just check stage match
    return interviewTypeNumber === stageNumber;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const time = `${hour}:${minute}`;
    
    if (selectedInterview) {
      const success = await onUpdateInterview(
        selectedInterview.id,
        stageId,
        date,
        time,
        selectedInterviewer
      );
      if (success) {
        onClose();
      }
    } else {
      const success = await onSchedule(stageId, date, time, selectedInterviewer);
      if (success) {
        onClose();
      }
    }
  };

  // Generate time options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={selectedInterview ? "Update Interview" : "Schedule Interview"}>
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
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                {hours.map(h => {
                  const hourInt = parseInt(h);
                  const period = hourInt >= 12 ? 'PM' : 'AM';
                  const display12Hour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
                  return (
                    <option key={h} value={h}>
                      {display12Hour} {period}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                {minutes.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
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
              {(stageId === 'TECHNICAL' || stageId === 'CULTURAL')
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
            {selectedInterview ? "Update Interview" : "Schedule Interview"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ScheduleInterviewModal;