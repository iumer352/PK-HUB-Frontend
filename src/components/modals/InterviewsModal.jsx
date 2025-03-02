import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BaseModal from './BaseModal';

const InterviewsModal = ({ show, onClose, interviews }) => {
  const navigate = useNavigate();

  // Helper function to format date and time from UTC and calculate days until interview
  const formatDateTime = (utcString) => {
    try {
      const date = new Date(utcString);
      if (isNaN(date.getTime())) {
        return { date: 'Date not available', time: 'Time not available', daysUntil: 'N/A' };
      }

      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });

      // Calculate days until interview
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysUntil = diffDays === 0 ? 'Today' : 
                       diffDays === 1 ? 'Tomorrow' :
                       diffDays > 0 ? `In ${diffDays} days` :
                       'Past due';

      return { date: dateStr, time: timeStr, daysUntil };
    } catch (error) {
      return { date: 'Date not available', time: 'Time not available', daysUntil: 'N/A' };
    }
  };

  return (
    <BaseModal isOpen={show} onClose={onClose} title="Upcoming Interviews">
      <div className="space-y-4">
        {interviews.map((interview) => {
          const { date, time, daysUntil } = formatDateTime(interview.date_time);
          return (
            <div 
              key={interview.id} 
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {interview.applicant.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {interview.applicant.Job.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {time}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/interview-tracking/${interview.applicant.id}`);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Track Interview
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </BaseModal>
  );
};

export default InterviewsModal;