const Applicant = require('../models/Applicant');
const Job = require('../models/Job');

// Get all applicants
exports.getApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.findAll();
        res.json(applicants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single applicant
exports.getApplicant = async (req, res) => {
    try {
        const applicant = await Applicant.findByPk(req.params.id);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        res.json(applicant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get applicants for a specific job by Job ID
exports.getApplicantsByJobId = async (req, res) => {
    const { jobId } = req.params;

    try {
        // Validate the Job ID parameter
        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        // Find the job by Job ID
        const job = await Job.findByPk(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Find applicants for the job
        const applicants = await Applicant.findAll({
            where: {
                JobId: jobId
            }
        });

        if (applicants.length === 0) {
            return res.status(404).json({ message: 'No applicants found for this job' });
        }

        // Return the applicants
        res.json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ message: 'Error fetching applicants' });
    }
};

// Create an applicant
exports.createApplicant = async (req, res) => {
    try {
        const { name, email, phone, resume, JobId } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !resume || !JobId) {
            return res.status(400).json({ 
                message: 'Please provide all required fields: name, email, phone, resume, and JobId' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Check if job exists
        const job = await Job.findByPk(JobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Create the applicant
        const applicant = await Applicant.create({
            name,
            email,
            phone,
            resume,
            status: 'applied', // default status
            JobId
        });

        res.status(201).json(applicant);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error('Error creating applicant:', error);
        res.status(500).json({ message: 'Error creating applicant' });
    }
};

// Update applicant status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const applicant = await Applicant.findByPk(id);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        await applicant.update({ status });
        res.json(applicant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
