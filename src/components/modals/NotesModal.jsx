import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

const NotesModal = ({ isOpen, onClose, interview, onSave, interviewers }) => {
  const [notes, setNotes] = useState(interview?.notes || '');

  // Update notes when interview prop changes
  useEffect(() => {
    setNotes(interview?.notes || '');
  }, [interview]);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Interview Notes">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interview Type
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={interview?.type || ''}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interviewer
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={interviewers.find(i => i.id === interview?.interviewerId)?.name || ''}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter interview notes..."
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
            Save Notes
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default NotesModal;
