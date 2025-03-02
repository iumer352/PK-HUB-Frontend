import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';

const OnboardSuccessModal = ({ isOpen, onClose, jobId, employeeName }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState('');

  const handleCloseJob = async () => {
    try {
      setIsClosing(true);
      const response = await axios.patch(`http://localhost:5000/api/jobs/${jobId}/status`, {
        status: 'Closed'
      });

      if (response.status === 200) {
        setMessage('Job opening closed successfully');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error closing job:', error);
      setMessage('Failed to close job opening');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md m-4"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Successfully Onboarded Employee
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {employeeName} has been successfully onboarded to the system.
              </p>
              {message && (
                <p className={`text-sm mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleCloseJob}
                  disabled={isClosing}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isClosing ? 'Closing...' : 'Close Job Opening'}
                </button>
                <button
                  onClick={onClose}
                  disabled={isClosing}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 disabled:opacity-50"
                >
                  Keep Job Open
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardSuccessModal; 