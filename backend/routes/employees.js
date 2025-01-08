const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Applicant = require('../models/Applicant');

// Create new employee from applicant
router.post('/', async (req, res) => {
  try {
    const { name, department, role, status, applicantId } = req.body;

    // Create new employee
    const employee = await Employee.create({
      name,
      department,
      role,
      status
    });

    // Update applicant status if applicantId is provided
    if (applicantId) {
      await Applicant.update(
        { status: 'hired' },
        { where: { id: applicantId } }
      );
    }

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee', error: error.message });
  }
});

module.exports = router;
