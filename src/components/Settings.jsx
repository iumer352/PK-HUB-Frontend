import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Calendar 
} from 'lucide-react';
import axios from 'axios';
import PasswordChangeModal from './modals/PasswordChangeModal';
import ConfirmationModal from './modals/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const lastLogin = new Date(user.lastLogin || Date.now()).toLocaleString();
  const joinDate = new Date(user.createdAt || Date.now()).toLocaleDateString();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        '/api/auth/updatePassword',
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setSuccess('Password updated successfully');
        setShowPasswordModal(false);
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowConfirmation(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 lg:py-8 xl:py-12 px-3 lg:px-4 xl:px-8">
      <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto space-y-4 lg:space-y-6 xl:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg xl:shadow-xl p-4 lg:p-6 xl:p-8">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="p-3 lg:p-3.5 xl:p-4 bg-blue-100 rounded-lg lg:rounded-xl xl:rounded-2xl">
              <User className="w-6 lg:w-8 xl:w-10 h-6 lg:h-8 xl:h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm lg:text-base xl:text-lg text-gray-500">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 lg:mb-4 p-3 lg:p-4 bg-red-100 text-red-700 rounded-lg xl:rounded-xl flex items-center text-sm lg:text-base"
          >
            <AlertCircle className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 lg:mb-4 p-3 lg:p-4 bg-green-100 text-green-700 rounded-lg xl:rounded-xl flex items-center text-sm lg:text-base"
          >
            <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
            {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg xl:shadow-xl p-4 lg:p-6 xl:p-8">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-5 xl:mb-6">
              <Mail className="w-5 lg:w-5 xl:w-6 h-5 lg:h-5 xl:h-6 text-blue-600" />
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm lg:text-base xl:text-lg font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg xl:shadow-xl p-4 lg:p-6 xl:p-8">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-5 xl:mb-6">
              <Shield className="w-5 lg:w-5 xl:w-6 h-5 lg:h-5 xl:h-6 text-blue-600" />
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Account Security</h2>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <p className="text-sm lg:text-base text-gray-600">Protect your account by updating your password regularly.</p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center px-3 lg:px-4 py-2 lg:py-3 border border-transparent rounded-lg xl:rounded-xl text-xs lg:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Key className="w-4 lg:w-4 xl:w-5 h-4 lg:h-4 xl:h-5 mr-2" />
                Update Password
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg xl:shadow-xl p-4 lg:p-6 xl:p-8">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-4 lg:mb-5 xl:mb-6">
              <Calendar className="w-5 lg:w-5 xl:w-6 h-5 lg:h-5 xl:h-6 text-blue-600" />
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Account Details</h2>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-sm lg:text-base xl:text-lg font-medium text-gray-900">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {showPasswordModal && (
          <PasswordChangeModal
            show={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            passwordChange={passwords}
            setPasswordChange={setPasswords}
            onSubmit={handleSubmit}
          />
        )}

        {showConfirmation && (
          <ConfirmationModal
            show={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleSignOut}
            message="Your password has been updated successfully. Please sign in again with your new password."
          />
        )}
      </div>
    </div>
  );
};

export default Settings; 