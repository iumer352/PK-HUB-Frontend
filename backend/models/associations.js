const Employee = require('./Employee');
const Project = require('./Project');
const ProjectAssignee = require('./ProjectAssignee');

// Define Project-Employee many-to-many relationship
Project.belongsToMany(Employee, {
    through: ProjectAssignee,
    as: 'assignees',
    foreignKey: 'projectId'
});

Employee.belongsToMany(Project, {
    through: ProjectAssignee,
    as: 'projects',
    foreignKey: 'employeeId'
});

module.exports = {
    Employee,
    Project,
    ProjectAssignee
};