import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const JobPosting = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [grade, setGrade] = useState('');
    const [hiringManager, setHiringManager] = useState('');
    const [hiringUrgency, setHiringUrgency] = useState('Normal');
    const [roleOverview, setRoleOverview] = useState('');
    const [keyResponsibilities, setKeyResponsibilities] = useState('');
    const [keySkillsAndCompetencies, setKeySkillsAndCompetencies] = useState('');
    const [functionType, setFunctionType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const grades = [
        'Analyst',
        'Associate',
        'Senior Associate',
        'Assistant',
        'Manager-1',
        'Manager-2',
        'Senior Manager',
        'Director'
    ];

    const functionTypes = [
        'Data Transformation',
        'Analytics and AI',
        'Low Code',
        'Digital Enablement',
        'Innovation and Emerging Tech'
    ];

    const hiringManagers = ['Simon Irvine'];

    const urgencyLevels = [
        'Urgent - Immediate Hire',
        'High Priority',
        'Normal',
        'Low Priority'
    ];

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Urgent - Immediate Hire':
                return 'text-red-600';
            case 'High Priority':
                return 'text-orange-500';
            case 'Normal':
                return 'text-blue-600';
            case 'Low Priority':
                return 'text-green-600';
            default:
                return 'text-gray-700';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const response = await axios.post('http://localhost:5000/api/jobs', {
                title: jobTitle,
                grade: grade,
                hiringManager: hiringManager,
                hiringUrgency: hiringUrgency,
                roleOverview: roleOverview,
                keyResponsibilities: keyResponsibilities,
                keySkillsAndCompetencies: keySkillsAndCompetencies,
                functionType: functionType,
                status: 'Active'
            });

            if (response.status === 201) {
                setSuccess(true);
                // Clear form
                setJobTitle('');
                setGrade('');
                setHiringManager('');
                setHiringUrgency('Normal');
                setRoleOverview('');
                setKeyResponsibilities('');
                setKeySkillsAndCompetencies('');
                setFunctionType('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating job posting');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg backdrop-filter">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <h1 className="text-2xl font-bold text-white">Create New Job Posting</h1>
                        <p className="text-blue-100 mt-1">Fill in the details below to create a new job opportunity</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-md"
                            >
                                Job posting created successfully!
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    required
                                    placeholder="Enter job title"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Role Overview
                                </label>
                                <textarea
                                    value={roleOverview}
                                    onChange={(e) => setRoleOverview(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                    required
                                    placeholder="Provide an overview of the role"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Key Responsibilities
                                </label>
                                <textarea
                                    value={keyResponsibilities}
                                    onChange={(e) => setKeyResponsibilities(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                    required
                                    placeholder="List the key responsibilities"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Key Skills and Competencies
                                </label>
                                <textarea
                                    value={keySkillsAndCompetencies}
                                    onChange={(e) => setKeySkillsAndCompetencies(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                    required
                                    placeholder="List required skills and competencies"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Function
                                </label>
                                <select
                                    value={functionType}
                                    onChange={(e) => setFunctionType(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    required
                                >
                                    <option value="">Select Function</option>
                                    {functionTypes.map((func) => (
                                        <option key={func} value={func}>
                                            {func}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Position Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Grade
                                        </label>
                                        <select
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            {grades.map((g) => (
                                                <option key={g} value={g}>
                                                    {g}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Hiring Manager
                                        </label>
                                        <select
                                            value={hiringManager}
                                            onChange={(e) => setHiringManager(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            required
                                        >
                                            <option value="">Select Hiring Manager</option>
                                            {hiringManagers.map((manager) => (
                                                <option key={manager} value={manager}>
                                                    {manager}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Hiring Urgency
                                        </label>
                                        <select
                                            value={hiringUrgency}
                                            onChange={(e) => setHiringUrgency(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            required
                                        >
                                            {urgencyLevels.map((urgency) => (
                                                <option 
                                                    key={urgency} 
                                                    value={urgency}
                                                    className={getUrgencyColor(urgency)}
                                                >
                                                    {urgency}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Create Job Posting
                            </motion.button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default JobPosting;