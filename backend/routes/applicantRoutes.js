const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

// Get all jobs
router.get('/', applicantController.getApplicants);

// Get applicants by jobid
router.get('/job/:jobId', applicantController.getApplicantsByJobId);

// Get a single job
router.get('/:id', applicantController.getApplicant);

// Create a new job
router.post('/', applicantController.createApplicant);

// Update a job
router.put('/:id', applicantController.updateStatus);


module.exports = router;
