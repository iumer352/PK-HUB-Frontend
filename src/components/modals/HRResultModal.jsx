import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';

const HRResultModal = ({ 
  isOpen, 
  stageId, 
  applicantId, 
  onClose, 
  initialData,
  onSave 
}) => {
  const [result, setResult] = useState('');
  const [feedback, setFeedback] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [location, setLocation] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [willingToTravelSaudi, setWillingToTravelSaudi] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add useEffect to fetch location when modal opens
  useEffect(() => {
    const fetchLocation = async () => {
      if (isOpen && applicantId) {
        try {
          const response = await axios.get(
            `/api/applicant/${applicantId}/`
          );
          setLocation(response.data.location || '');
        } catch (error) {
          console.error('Error fetching location:', error);
        }
      }
    };

    fetchLocation();
  }, [isOpen, applicantId]);

  useEffect(() => {
    if (isOpen && initialData) {
      setCurrentSalary(initialData.current_salary || '');
      setExpectedSalary(initialData.expected_salary || '');
      setNoticePeriod(initialData.notice_period || '');
      setResult(initialData.result || '');
      setFeedback(initialData.feedback || '');
      setWillingToRelocate(initialData.willing_to_relocate || false);
      setWillingToTravelSaudi(initialData.willing_to_travel_saudi || false);
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!stageId || !applicantId) {
      alert('Missing required stage ID or applicant ID');
      return;
    }

    try {
      setLoading(true);
      const data = {
        result,
        feedback,
        currentSalary: currentSalary ,
        expectedSalary: expectedSalary ,
        noticePeriod: noticePeriod ,
        willingToRelocate: willingToRelocate,
        willingToTravelSaudi: willingToTravelSaudi,
        location
      };

      console.log("Submitting data:", data);

      // Save HR result
      const response = await axios.put(
        `/api/interview/stages/1/applicant/${applicantId}/hr-result`,
        data
      );

      console.log("API Response:", response.data);

      // Update location
      await axios.patch(
        `/api/applicant/${applicantId}/location`,
        { location: data.location }
      );

      // Close modal and refresh page
      onClose();
      window.location.reload();
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

        {/* Salary Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Salary (PKR)</label>
            <input
              type="text"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current salary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary (PKR)</label>
            <input
              type="text"
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
            type="text"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter notice period in days"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Based In</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
