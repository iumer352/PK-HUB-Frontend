const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['id', 'name', 'role', 'department', 'createdAt', 'updatedAt']
    });
    
    // Transform to ensure consistent ID format
    const transformedEmployees = employees.map(emp => {
      const plainEmp = emp.get({ plain: true });
      return {
        ...plainEmp,
        _id: plainEmp.id // Add _id for consistency
      };
    });
    
    res.status(200).json(transformedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount, [updatedEmployee]] = await Employee.update(req.body, {
      where: { id }, 
      returning: true, 
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Employee.destroy({ where: { id } });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    // Your existing stats code
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};