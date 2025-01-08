import React, { useState } from 'react';
import BaseModal from './BaseModal';

const ScheduleInterviewModal = ({ isOpen, onClose, onSchedule, stageId, interviewers }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');

  // Filter interviewers based on their interview_type matching the stage
  const filteredInterviewers = interviewers.filter(interviewer => {
    const interviewType = interviewer.interview_type?.toUpperCase() || '';
    const stage = stageId?.toUpperCase() || '';
    
    return interviewType === stage;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(stageId, date, time, selectedInterviewer);
    onClose();
  };

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
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
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
              </option>
            ))}
          </select>
          {filteredInterviewers.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              No interviewers available for {stageId} round. Please contact HR to assign interviewers.
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
