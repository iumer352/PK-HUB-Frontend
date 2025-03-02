import React, { useState } from 'react';
import axios from 'axios';

const InterviewTracking = () => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const handleScheduleInterview = async (stageId, date, time, interviewerId, interviewId) => {
    try {
      const endpoint = interviewId 
        ? `http://localhost:5000/api/interviews/${interviewId}` 
        : 'http://localhost:5000/api/interviews';
      
      const method = interviewId ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url: endpoint,
        data: {
          date_time: `${date}T${time}`,
          interviewer_id: interviewerId,
          stage_id: stageId,
          applicant_id: selectedApplicant.id
        }
      });

      // Refresh the data
      fetchApplicants();
      return true;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      return false;
    }
  };

  return (
    <div>
      {/* Rest of the component code */}
    </div>
  );
};

export default InterviewTracking; 