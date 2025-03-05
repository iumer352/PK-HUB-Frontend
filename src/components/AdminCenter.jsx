import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Modal from './modals/Modal';
import PasswordChangeModal from './modals/PasswordChangeModal';
import RegisterUserModal from './modals/RegisterUserModal';
import ConfirmationModal from './modals/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const AdminCenter = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Extract users from the nested data structure
      const usersArray = response.data?.data?.users || [];
      console.log('Users array:', usersArray);
      
      setUsers(usersArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      
      // Log the request details
      console.log('Updating role:', { userId, newRole });
      
      await axios.patch(  // Changed from put to patch
        'http://localhost:5000/api/auth/updateUserRole',
        {
          userId,
          newRole  // Changed from role to newRole to match API
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccessMessage('Role updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      // Refresh users list after update
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/auth/register',
        formValues,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccessMessage('User registered successfully');
      setShowRegisterModal(false);
      fetchUsers(); // Refresh users list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register user');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/auth/updatePassword',
        {
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setSuccessMessage('Password updated successfully');
        setShowPasswordModal(false);
        setPasswordChange({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowConfirmation(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 lg:py-8 xl:py-12 px-3 lg:px-4 xl:px-8">
      <div className="max-w-3xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg xl:shadow-xl p-4 lg:p-5 xl:p-8 mb-4 lg:mb-5 xl:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
              <div className="p-1.5 lg:p-2 xl:p-3 bg-indigo-100 rounded-md lg:rounded-lg xl:rounded-xl">
                <Shield className="w-5 lg:w-6 xl:w-8 h-5 lg:h-6 xl:h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl xl:text-3xl font-bold text-gray-900">Admin Center</h1>
                <p className="text-xs lg:text-sm xl:text-lg text-gray-500">Manage user roles and permissions</p>
              </div>
            </div>
            <div className="flex space-x-2 lg:space-x-3 xl:space-x-4">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm xl:text-base bg-green-600 text-white rounded-md lg:rounded-lg hover:bg-green-700 transition-colors"
              >
                Register New User
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm xl:text-base bg-blue-600 text-white rounded-md lg:rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 lg:mb-4 p-2 lg:p-3 xl:p-4 bg-green-100 text-green-700 rounded-md lg:rounded-lg xl:rounded-xl flex items-center text-xs lg:text-sm xl:text-base"
          >
            <CheckCircle className="w-3.5 lg:w-4 xl:w-5 h-3.5 lg:h-4 xl:h-5 mr-1.5 lg:mr-2" />
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 lg:p-4 bg-red-100 text-red-700 rounded-lg xl:rounded-xl flex items-center text-sm lg:text-base"
          >
            <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            {error}
          </motion.div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg xl:shadow-xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 lg:p-4 xl:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-base lg:text-lg xl:text-xl font-medium text-indigo-600">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm lg:text-base xl:text-lg font-medium text-gray-900">{user.email}</h3>
                        <p className="text-[10px] lg:text-xs xl:text-sm text-gray-400">
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] lg:text-xs xl:text-sm text-gray-400">Current Role: {user.role}</p>
                      </div>
                    </div>
                    
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="ml-3 lg:ml-4 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm xl:text-base border border-gray-300 rounded-md lg:rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="hr">HR</option>
                      <option value="interviewer">Interviewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-3 lg:p-4 xl:p-6 text-center text-gray-500 text-xs lg:text-sm xl:text-base">
                No users found
              </div>
            )}
          </div>
        </div>

        {showPasswordModal && (
          <PasswordChangeModal
            show={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            passwordChange={passwordChange}
            setPasswordChange={setPasswordChange}
            onSubmit={handlePasswordChange}
          />
        )}
        {showRegisterModal && (
          <RegisterUserModal
            show={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
            formValues={formValues}
            setFormValues={setFormValues}
            onSubmit={handleRegister}
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

export default AdminCenter; 