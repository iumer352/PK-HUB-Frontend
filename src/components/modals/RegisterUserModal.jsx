import React, { useState } from 'react';
import Modal from './Modal';

const RegisterUserModal = ({ 
  show, 
  onClose, 
  formValues, 
  setFormValues, 
  onSubmit 
}) => {
  const [error, setError] = useState('');

  const handleClose = () => {
    setFormValues({ name: '', email: '', password: '', role: 'user' });
    setError('');
    onClose();
  };

  // Add email validation function
  const validateEmail = (email) => {
    return email.toLowerCase().endsWith('@kpmg.com');
  };

  // Update handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if email ends with @kpmg.com
    if (!validateEmail(formValues.email)) {
      setError('Email must be a valid KPMG email address (@kpmg.com)');
      return;
    }

    setError('');
    onSubmit(e);
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title="Register New User"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formValues.email}
            onChange={(e) => {
              setFormValues({ ...formValues, email: e.target.value });
              // Clear error when user starts typing
              if (error) setError('');
            }}
            onBlur={() => {
              // Validate on blur
              if (formValues.email && !validateEmail(formValues.email)) {
                setError('Email must be a valid KPMG email address (@kpmg.com)');
              }
            }}
            className={`mt-1 block w-full rounded-md shadow-sm 
              ${error && formValues.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder="name@kpmg.com"
            required
          />
          {error && formValues.email && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={formValues.password}
            onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            value={formValues.role}
            onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="user">User</option>
            <option value="hr">HR</option>
            <option value="interviewer">Interviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Register User
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterUserModal; 