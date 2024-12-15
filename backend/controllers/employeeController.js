import Employee from '../models/Employee.js';

// Get all employees
export const getEmployees = async (req, res) => {
    try {
        const { name, role, day } = req.query;
        let query = {};

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (role) {
            query.role = role;
        }
        if (day) {
            query['availability.day'] = day;
        }

        const employees = await Employee.find(query);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new employee
export const addEmployee = async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an employee
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEmployee = await Employee.findByIdAndDelete(id);

        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single employee by ID
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeById };
