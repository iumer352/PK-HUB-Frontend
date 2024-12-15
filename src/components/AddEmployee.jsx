import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projects: []
  });

  const [projectInput, setProjectInput] = useState({
    name: '',
    description: '',
    startDate: null,
    endDate: null
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Submitting:', formData);

    setSuccessMessage('Employee added successfully!');
    setErrorMessage('');

    // Reset form after successful submission
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      projects: []
    });

    // Navigate back to the dashboard after a short delay
    setTimeout(() => {
      navigate('/view-employees');
    }, 2000);
  };

  const handleAddProject = () => {
    if (projectInput.name && projectInput.startDate && projectInput.endDate) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, { ...projectInput }]
      }));
      setProjectInput({
        name: '',
        description: '',
        startDate: null,
        endDate: null
      });
    }
  };

  const handleRemoveProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Add New Employee
          </h1>
          <p className="mt-2 text-gray-600">Enter employee details and project information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMessage}
              </div>
            </div>
          )}

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter employee first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter employee last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter employee email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter employee phone"
                  required
                />
              </div>
            </div>

            {/* Project Information */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    value={projectInput.name}
                    onChange={(e) => setProjectInput(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Description</label>
                  <textarea
                    value={projectInput.description}
                    onChange={(e) => setProjectInput(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows="3"
                    placeholder="Enter project description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Start Date</label>
                    <DatePicker
                      selected={projectInput.startDate}
                      onChange={date => setProjectInput(prev => ({ ...prev, startDate: date }))}
                      className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholderText="Select start date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project End Date</label>
                    <DatePicker
                      selected={projectInput.endDate}
                      onChange={date => setProjectInput(prev => ({ ...prev, endDate: date }))}
                      minDate={projectInput.startDate}
                      className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholderText="Select end date"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddProject}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Add Project
                </button>
              </div>

              {/* Display added projects */}
              {formData.projects.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Projects:</h4>
                  {formData.projects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div>
                        <h5 className="font-medium text-gray-900">{project.name}</h5>
                        <p className="text-sm text-gray-500">{project.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {project.startDate.toLocaleDateString()} - {project.endDate.toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProject(index)}
                        className="text-red-600 hover:text-red-800 focus:outline-none p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/view-employees')}
                className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add Employee
              </button>
            </div>
          </div>
        </form>

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddEmployee;
