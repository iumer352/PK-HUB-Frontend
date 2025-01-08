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

// Create applicants from parsed resumes
exports.createApplicantsFromParsedResumes = async (req, res) => {
    try {
        const { successful_parses, failed_files, jobId } = req.body;
        const results = {
            created: [],
            failed: []
        };

        console.log('Request body:', {
            jobId,
            successful_parses_count: successful_parses?.length,
            failed_files_count: failed_files?.length});

        // Validate jobId
        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        // Check if job exists
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        for (const parse of successful_parses) {
            try {
                // Prepare resume data with score and score details
                const resumeData = {
                    ...parse.content,
                    score: parse.score || 0,
                    score_details: parse.score_details || {
                        Skills_Score: 0,
                        Experience_Score: 0,
                        Education_Score: 0,
                        Certification_Score: 0
                    }
                };

                const applicantData = {
                    name: parse.content.Name,
                    email: parse.content.Email,
                    phone: parse.content.Phone,
                    resume: JSON.stringify(resumeData), // Store the full parsed content with scores
                    status: 'applied',
                    job_id: jobId
                };

                // Basic validation
                if (!applicantData.name || !applicantData.email || !applicantData.phone) {
                    results.failed.push({
                        filename: parse.filename,
                        reason: 'Missing required fields'
                    });
                    continue;
                }

                // Create the applicant record
                const applicant = await Applicant.create(applicantData);
                results.created.push({
                    filename: parse.filename,
                    applicantId: applicant.id,
                    score: parse.score || 0
                });
            } catch (error) {
                results.failed.push({
                    filename: parse.filename,
                    reason: error.name === 'SequelizeUniqueConstraintError' ? 
                           'Email already exists' : 
                           'Database error'
                });
            }
        }

        // Add any failed files from the parser
        if (failed_files && Array.isArray(failed_files)) {
            results.failed.push(...failed_files.map(file => ({
                filename: file,
                reason: 'Parser failed to extract data'
            })));
        }

        res.status(201).json(results);
    } catch (error) {
        console.error('Error creating applicants:', error);
        res.status(500).json({ 
            message: 'Error processing parsed resumes',
            error: error.message 
        });
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
