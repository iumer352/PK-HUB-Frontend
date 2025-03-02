import React from 'react';
import Modal from './Modal';

export default function PasswordChangeModal({ 
  show, 
  onClose, 
  passwordChange, 
  setPasswordChange, 
  onSubmit 
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Change Password"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={passwordChange.currentPassword}
            onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={passwordChange.newPassword}
            onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordChange.confirmPassword}
            onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Update Password
          </button>
        </div>
      </form>
    </Modal>
  );
} 