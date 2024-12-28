const Employee = require('./Employee');
const Project = require('./Project');
const ProjectAssignee = require('./ProjectAssignee');
const Interview = require('./Interview');
const Applicant = require('./Applicant');

// Project-Employee many-to-many relationship
Project.belongsToMany(Employee, {
    through: ProjectAssignee,
    as: 'assignees',
    foreignKey: 'project_id'
});

Employee.belongsToMany(Project, {
    through: ProjectAssignee,
    as: 'projects',
    foreignKey: 'employee_id'
});

// Interview associations
Interview.belongsTo(Applicant, {
    foreignKey: 'applicant_id',
    as: 'applicant'
});

Interview.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'interviewer'
});

// Reverse associations
Applicant.hasMany(Interview, {
    foreignKey: 'applicant_id',
    as: 'interviews'
});

Employee.hasMany(Interview, {
    foreignKey: 'employee_id',
    as: 'conductedInterviews'
});

module.exports = {
    Employee,
    Project,
    ProjectAssignee,
    Interview,
    Applicant
};