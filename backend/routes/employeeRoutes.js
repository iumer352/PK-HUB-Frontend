import express from 'express';
import {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById
} from '../controllers/employeeController.js';

const router = express.Router();

// Get all employees with optional filtering
router.get('/', getEmployees);

// Add a new employee
router.post('/', addEmployee);

// Update an employee
router.put('/:id', updateEmployee);

// Delete an employee
router.delete('/:id', deleteEmployee);

// Get a single employee by ID
router.get('/:id', getEmployeeById);

export default router;
