import React from 'react';
import Modal from './Modal';

const ConfirmationModal = ({ show, onClose, onConfirm, message }) => (
  <Modal
    show={show}
    onClose={onClose}
    title="Password Updated"
  >
    <div className="space-y-6">
      <p className="text-gray-700">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmationModal; 