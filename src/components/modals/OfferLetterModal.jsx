import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';

const OfferLetterModal = ({ isOpen, onClose, onSchedule, applicantId }) => {
  const [offerStatus, setOfferStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current offer status when modal opens
  useEffect(() => {
    if (isOpen && applicantId) {
      fetchOfferStatus();
    }
  }, [isOpen, applicantId]);

  const fetchOfferStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/applicant/${applicantId}/offer-status`);
      setOfferStatus(response.data.offer_status);
    } catch (error) {
      console.error('Error fetching offer status:', error);
      setError('Failed to fetch offer status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update offer status
      await axios.post(`http://localhost:5000/api/applicant/${applicantId}/offer-status`, {
        offer_status: offerStatus
      });

      // Call the onSchedule callback with the result
      onSchedule({
        result: offerStatus === 'accepted' ? 'pass' : 'fail',
        offerStatus
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating offer status:', error);
      setError('Failed to update offer status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Offer Letter Status">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Offer Letter Status">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-4">
            What is the status of the offer letter?
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setOfferStatus('accepted')}
              className={`px-6 py-3 rounded-lg ${
                offerStatus === 'accepted'
                  ? 'bg-green-100 text-green-800 border-2 border-green-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setOfferStatus('rejected')}
              className={`px-6 py-3 rounded-lg ${
                offerStatus === 'rejected'
                  ? 'bg-red-100 text-red-800 border-2 border-red-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setOfferStatus('pending')}
              className={`px-6 py-3 rounded-lg ${
                offerStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
          </div>
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
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Save Status
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default OfferLetterModal;
