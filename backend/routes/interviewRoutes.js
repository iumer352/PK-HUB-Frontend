const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');


// Get all interviews for an applicant
router.get('/applicant/:applicantId', interviewController.getInterviews);

// Get a single interview
router.get('/:id', interviewController.getInterview);

// Schedule a new interview
router.post('/', interviewController.scheduleInterview);

// Update interview status
router.patch('/:id/status', interviewController.updateStatus);

// Submit interview feedback
router.patch('/:id/feedback', interviewController.submitFeedback);

module.exports = router;