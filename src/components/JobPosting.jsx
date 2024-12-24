import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const JobPosting = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobType, setJobType] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [requirements, setRequirements] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const response = await axios.post('http://localhost:5000/api/jobs', {
                title: jobTitle,
                company: companyName,
                description: jobDescription,
                type: jobType,
                location: location,
                salary: salary,
                requirements: requirements,
                status: 'Active'
            });

            if (response.status === 201) {
                setSuccess(true);
                // Clear form
                setJobTitle('');
                setJobDescription('');
                setCompanyName('');
                setJobType('');
                setLocation('');
                setSalary('');
                setRequirements('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating job posting');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                    <h2 className="text-3xl font-bold text-white">Create Job Posting</h2>
                    <p className="text-blue-100 mt-2">Fill in the details below to post a new job opportunity</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 border-l-4 border-red-500">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 text-green-600 p-4 border-l-4 border-green-500">
                        Job posting created successfully!
                    </div>
                )}

                <form  className="p-8 space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                            placeholder="e.g. Senior Software Engineer"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                            placeholder="Your company name"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Job Description
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            required
                            rows="4"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                            placeholder="Describe the role and responsibilities"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Requirements
                        </label>
                        <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            required
                            rows="4"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                            placeholder="List the job requirements and qualifications"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Job Type
                            </label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                            >
                                <option value="">Select Job Type</option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                                placeholder="e.g. San Francisco, CA"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Salary Range
                        </label>
                        <input
                            type="text"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                            placeholder="e.g. $80,000 - $100,000"
                        />
                    </div>

                    <motion.button
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Post Job
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default JobPosting;