const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const interviewStageController = require('../controllers/interviewStageController');

// Interview Routes
// Get all interviews for an applicant
router.get('/applicant/:applicantId', interviewController.getInterviews);

// Get a single interview
router.get('/:id', interviewController.getInterview);

// Schedule first interview
router.post('/schedule-first', interviewController.scheduleFirstInterview);

// Schedule next interview
router.post('/schedule-next', interviewController.scheduleNextInterview);

// Schedule specific stage interview
router.post('/schedule-stage', interviewController.scheduleSpecificStage);

// Update interview status
router.patch('/:id/status', interviewController.updateStatus);

// Submit interview feedback
router.post('/stages/:interview_id/feedback', interviewController.submitFeedback);

// Interview Stage Routes
// Get all stages for an interview
router.get('/:interview_id/stages', interviewStageController.getStages);

// Create new stage
router.post('/stages', interviewStageController.createStage);

// Update stage
router.patch('/stages/:id', interviewStageController.updateStage);

module.exports = router;