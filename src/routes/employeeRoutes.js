const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get employee statistics
router.get('/api/employee/stats', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    
    // Get new hires in current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const newHires = await Employee.countDocuments({
      joinDate: { $gte: startOfMonth }
    });

    // Get department distribution
    const departmentData = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // Get role distribution
    const roleData = await Employee.aggregate([
      {
        $group: {
          _id: '$role',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      newHires,
      departmentData,
      roleData
    });
  } catch (error) {
    console.error('Error fetching employee statistics:', error);
    res.status(500).json({ message: 'Error fetching employee statistics' });
  }
});

module.exports = router;
