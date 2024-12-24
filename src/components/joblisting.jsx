import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const JobPostingForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const { jobId } = useParams();

    const [jobPosting, setJobPosting] = useState({
        title: '',
        company: '',
        location: '',
        type: '',
        salary: '',
        description: '',
        requirements: ''
    });

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (jobId) {
            const fetchJobData = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
                    setJobPosting(response.data);

                    const applicantsResponse = await axios.get(`http://localhost:5000/api/applicant/job/${jobId}`);
                    console.log(applicantsResponse.data);
                    setApplicants(applicantsResponse.data);
                } catch (err) {
                    setError('Failed to fetch job data');
                    console.error('Error:', err);
                }
            };
            fetchJobData();
        }
    }, [jobId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobPosting(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (files) {
            const newApplicants = Array.from(files).map((file, index) => ({
                id: Date.now() + index,
                name: file.name.split('.')[0],
                email: '',
                status: 'Pending',
                resume: file
            }));

            setApplicants(prev => [...prev, ...newApplicants]);
        }
    };

    const updateApplicantStatus = (id, status) => {
        setApplicants(prev =>
            prev.map(applicant =>
                applicant.id === id ? { ...applicant, status } : applicant
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (jobId) {
                await axios.put(`http://localhost:5000/api/jobs/${jobId}`, jobPosting);
            } else {
                await axios.post('http://localhost:5000/api/jobs', jobPosting);
            }
            navigate('/manage-jobs');
        } catch (err) {
            setError('Failed to save job posting');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInterviews = () => {
        navigate(`/interview-status/${jobId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">
                            {jobId ? 'Edit Job Posting' : 'Create Job Posting'}
                        </h1>
                        {jobId && (
                            <button
                                onClick={handleViewInterviews}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Check Interview Status
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="title"
                                value={jobPosting.title}
                                onChange={handleInputChange}
                                placeholder="Job Title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                name="company"
                                value={jobPosting.company}
                                onChange={handleInputChange}
                                placeholder="Company Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                name="location"
                                value={jobPosting.location}
                                onChange={handleInputChange}
                                placeholder="Location"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={jobPosting.type}
                                onChange={(e) => setJobPosting(prev => ({...prev, type: e.target.value}))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Job Type</option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                            </select>
                            <input
                                type="text"
                                name="salary"
                                value={jobPosting.salary}
                                onChange={handleInputChange}
                                placeholder="Salary Range"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <textarea
                            name="description"
                            value={jobPosting.description}
                            onChange={handleInputChange}
                            placeholder="Job Description"
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            name="requirements"
                            value={jobPosting.requirements}
                            onChange={handleInputChange}
                            placeholder="Job Requirements"
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Applicants</h2>
                        <div className="flex items-center space-x-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                multiple
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Import CVs
                            </button>
                        </div>
                    </div>

                    {applicants.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border p-2 text-left">Name</th>
                                        <th className="border p-2 text-left">Resume</th>
                                        <th className="border p-2 text-left">Status</th>
                                        <th className="border p-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map((applicant) => (
                                        <tr key={applicant.id} className="hover:bg-gray-50">
                                            <td className="border p-2">{applicant.name}</td>
                                            {<td className="border p-2">
                                                <a
                                                   
                                                >
                                                    View Resume
                                                </a>
                                            </td>}
                                            <td className="border p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs
                                                    ${applicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                    ${applicant.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                                                    ${applicant.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                                                `}>
                                                    {applicant.status}
                                                </span>
                                            </td>
                                            <td className="border p-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => updateApplicantStatus(applicant.id, 'Approved')}
                                                        className="px-2 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateApplicantStatus(applicant.id, 'Rejected')}
                                                        className="px-2 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            No applicants yet. Import CVs to get started.
                        </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Total Applicants: {applicants.length}
                        </p>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => navigate('/manage-jobs')}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Save Job Posting
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobPostingForm;
