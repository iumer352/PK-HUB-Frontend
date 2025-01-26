import React, { useState } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';

const HRResultModal = ({ isOpen, interview, stageId, applicantId, onClose }) => {
  const [result, setResult] = useState(interview?.result || '');
  const [feedback, setFeedback] = useState(interview?.feedback || '');
  const [currentSalary, setCurrentSalary] = useState(interview?.currentSalary || '');
  const [expectedSalary, setExpectedSalary] = useState(interview?.expectedSalary || '');
  const [noticePeriod, setNoticePeriod] = useState(interview?.noticePeriod || '');
  const [willingToRelocate, setWillingToRelocate] = useState(interview?.willingToRelocate || false);
  const [willingToTravelSaudi, setWillingToTravelSaudi] = useState(interview?.willingToTravelSaudi || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!stageId || !applicantId) {
      alert('Missing required stage ID or applicant ID');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`http://localhost:5000/api/interview/stages/${stageId}/applicant/${applicantId}/hr-result`, {
        result,
        feedback,
        currentSalary: parseFloat(currentSalary),
        expectedSalary: parseFloat(expectedSalary),
        noticePeriod: parseInt(noticePeriod),
        willingToRelocate,
        willingToTravelSaudi
      });
      onClose();
    } catch (error) {
      console.error('Error saving HR result:', error);
      alert('Failed to save HR result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="HR Round Result">
      <div className="space-y-4">
        {/* Result Selection */}
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

        {/* Salary Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Salary (SAR)</label>
            <input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current salary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary (SAR)</label>
            <input
              type="number"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter expected salary"
            />
          </div>
        </div>

        {/* Notice Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (days)</label>
          <input
            type="number"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter notice period in days"
          />
        </div>

        {/* Relocation and Travel */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="relocate"
              checked={willingToRelocate}
              onChange={(e) => setWillingToRelocate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="relocate" className="ml-2 block text-sm text-gray-700">
              Willing to Relocate
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="travelSaudi"
              checked={willingToTravelSaudi}
              onChange={(e) => setWillingToTravelSaudi(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="travelSaudi" className="ml-2 block text-sm text-gray-700">
              Willing to Travel to Saudi Arabia
            </label>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Enter detailed feedback about the HR round..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Result'}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default HRResultModal;
