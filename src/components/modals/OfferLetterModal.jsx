import React, { useState } from 'react';
import BaseModal from './BaseModal';

const OfferLetterModal = ({ isOpen, onClose, onSchedule }) => {
  const [offerAccepted, setOfferAccepted] = useState(null);

  const handleSubmit = () => {
    if (offerAccepted !== null) {
      onSchedule({
        result: offerAccepted ? 'pass' : 'fail',
        offerAccepted
      });
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Offer Letter Status">
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-4">Has the candidate accepted the offer letter?</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setOfferAccepted(true)}
              className={`px-6 py-3 rounded-lg ${
                offerAccepted === true
                  ? 'bg-green-100 text-green-800 border-2 border-green-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setOfferAccepted(false)}
              className={`px-6 py-3 rounded-lg ${
                offerAccepted === false
                  ? 'bg-red-100 text-red-800 border-2 border-red-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              No
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
            disabled={offerAccepted === null}
            className={`px-4 py-2 rounded-lg ${
              offerAccepted === null
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
