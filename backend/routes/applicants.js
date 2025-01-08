const express = require('express');
const router = express.Router();
const Applicant = require('../models/Applicant');

// Update applicant status
router.put('/:id/status', async (req, res) => {
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
    console.error('Error updating applicant status:', error);
    res.status(500).json({ message: 'Error updating applicant status', error: error.message });
  }
});

module.exports = router;
