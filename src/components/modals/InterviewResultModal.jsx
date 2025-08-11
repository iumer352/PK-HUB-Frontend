import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

const InterviewResultModal = ({ isOpen, interview, onClose, onSave }) => {
  const [result, setResult] = useState('pending');
  const [feedback, setFeedback] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && interview) {
      // Get result from the currentResult property which contains the API response
      const currentResult = interview.currentResult || {};
      
      setResult(currentResult.result || 'pending');
      setFeedback(currentResult.feedback || '');
      setNotes(currentResult.notes || '');

      console.log('Updating modal state:', {
        result: currentResult.result,
        feedback: currentResult.feedback,
        notes: currentResult.notes
      });
    }
  }, [isOpen, interview]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setResult('pending');
      setFeedback('');
      setNotes('');
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave({ result, feedback, notes });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Update Interview Result">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
          <div className="flex space-x-4">
            {['pass', 'fail', 'pending', 'Withdrawn'].map((option) => (
                        <button
                        key={option}
                        onClick={() => setResult(option)}
                        className={`px-4 py-2 rounded-lg capitalize ${
                          result === option
                            ? option === 'pass'
                              ? 'bg-green-100 text-green-800 border-2 border-green-500'
                              : option === 'fail'
                              ? 'bg-red-100 text-red-800 border-2 border-red-500'
                              : option === 'Withdrawn'
                              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
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

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
    </BaseModal>
  );
};

export default InterviewResultModal;