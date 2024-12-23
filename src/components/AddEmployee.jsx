import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    role: '',
    projectTitle: '',
    projectDescription: '',
    projectStartDate: '',
    projectEndDate: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
  const roles = {
    Engineering: ['Software Engineer', 'DevOps Engineer', 'QA Engineer', 'Tech Lead'],
    Design: ['UI Designer', 'UX Designer', 'Graphic Designer'],
    Marketing: ['Marketing Manager', 'Content Writer', 'SEO Specialist'],
    Sales: ['Sales Representative', 'Account Manager', 'Sales Manager'],
    HR: ['HR Manager', 'Recruiter', 'HR Coordinator'],
    Finance: ['Financial Analyst', 'Accountant', 'Finance Manager']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          department: formData.department,
          role: formData.role,
          projects: [{
            title: formData.projectTitle,
            description: formData.projectDescription,
            startDate: formData.projectStartDate,
            endDate: formData.projectEndDate
          }],
          workSchedule: {
            startTime: '9:00 AM',
            endTime: '5:00 PM'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

      setSuccessMessage('Employee added successfully!');
      setErrorMessage('');
      setFormData({
        name: '',
        department: '',
        role: '',
        projectTitle: '',
        projectDescription: '',
        projectStartDate: '',
        projectEndDate: ''
      });

      // Navigate back after successful submission
      setTimeout(() => {
        navigate('/dashboard/view-data');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Panel - Form Header */}
            <div className="p-8 bg-blue-600 rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none text-white">
              <h2 className="text-3xl font-bold mb-4">Add New Employee</h2>
              <p className="text-blue-100">Enter employee information and project details to create a new employee record.</p>
            </div>

            {/* Right Panel - Form Content */}
            <div className="lg:col-span-2 p-8">
              {successMessage && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  {/* Employee Information Section */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
                    
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter full name"
                      />
                    </div>

                    {/* Department and Role Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.department}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Role</option>
                          {formData.department && roles[formData.department].map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                    
                    <div>
                      <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Title
                      </label>
                      <input
                        type="text"
                        id="projectTitle"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Description
                      </label>
                      <textarea
                        id="projectDescription"
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter project description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <DatePicker
                          selected={formData.projectStartDate}
                          onChange={(date) => handleInputChange({ target: { name: 'projectStartDate', value: date } })}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          dateFormat="MMMM d, yyyy"
                          minDate={new Date()}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <DatePicker
                          selected={formData.projectEndDate}
                          onChange={(date) => handleInputChange({ target: { name: 'projectEndDate', value: date } })}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          dateFormat="MMMM d, yyyy"
                          minDate={formData.projectStartDate || new Date()}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/view-data')}
                    className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
