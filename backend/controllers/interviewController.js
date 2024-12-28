const Interview = require('../models/Interview');
const Employee = require('../models/Employee');
const Applicant = require('../models/Applicant');

// Get all interviews for an applicant
exports.getInterviews = async (req, res) => {
  try {
    const { applicantId } = req.params;
    console.log('Fetching interviews for applicant:', applicantId);
    
    // First check if applicant exists
    const applicant = await Applicant.findByPk(applicantId);
    if (!applicant) {
      console.log('Applicant not found:', applicantId);
      return res.status(404).json({ message: 'Applicant not found' });
    }

    console.log('Found applicant:', applicant.id);

    // Get interviews with interviewer details
    const interviews = await Interview.findAll({
      where: { applicant_id: applicantId },
      include: [{
        model: Employee,
        as: 'interviewer',
        attributes: ['id', 'name', 'role']
      }],
      order: [['date_time', 'DESC']]
    });

    console.log('Found interviews:', interviews.length);
    res.status(200).json(interviews);
  } catch (error) {
    console.error('Error in getInterviews:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching interviews',
      error: error.message,
      stack: error.stack 
    });
  }
};

// Get a single interview
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      where: { id: req.params.id },
      include: [{
        model: Employee,
        as: 'interviewer',
        attributes: ['id', 'name', 'position']
      }]
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.status(200).json(interview);
  } catch (error) {
    console.error('Error in getInterview:', error);
    res.status(500).json({ message: 'Error fetching interview' });
  }
};

// Schedule an interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicant_id, employee_id, date_time, type } = req.body;

    const interview = await Interview.create({
      applicant_id,
      employee_id,
      date_time,
      type,
      status: 'scheduled'
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error in scheduleInterview:', error);
    res.status(500).json({ error });
  }
};

// Update interview status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = status;
    await interview.save();

    res.status(200).json(interview);
  } catch (error) {
    console.error('Error in updateStatus:', error);
    res.status(500).json({ message: 'Error updating interview status' });
  }
};

// Submit interview feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { result, feedback, notes } = req.body;

    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.result = result;
    interview.feedback = feedback;
    interview.notes = notes;
    interview.status = 'completed';

    await interview.save();

    res.status(200).json(interview);
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};
