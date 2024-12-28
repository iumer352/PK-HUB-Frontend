const Employee = require('./Employee');
const Project = require('./Project');
const ProjectAssignee = require('./ProjectAssignee');
const Interview = require('./Interview');
const Applicant = require('./Applicant');
const InterviewStage = require('./InterviewStage');
const StageLookup = require('./stage_lookup')
const Job = require('./Job');
const Interviewer = require('./Interviewer');

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
  
Interview.belongsTo(Interviewer, {
    foreignKey: 'interviewer_id',
    as: 'interviewer'
});
  
Interview.hasMany(InterviewStage, {
    foreignKey: 'interview_id',
    as: 'stages'
});
  
// Interview Stage associations
InterviewStage.belongsTo(Interview, {
    foreignKey: 'interview_id'
});
  
InterviewStage.belongsTo(StageLookup, {
    foreignKey: 'stage_id',
    as: 'stage'
});
  
// Reverse associations
Applicant.hasMany(Interview, {
    foreignKey: 'applicant_id',
    as: 'interviews'
});
  
Interviewer.hasMany(Interview, {
    foreignKey: 'interviewer_id',
    as: 'conducted_interviews'
});
  
StageLookup.hasMany(InterviewStage, {
    foreignKey: 'stage_id',
    as: 'interview_stages'
});

// Job-Applicant association
Applicant.belongsTo(Job, {
    foreignKey: 'job_id',
    as: 'job'
});

Job.hasMany(Applicant, {
    foreignKey: 'job_id',
    as: 'applicants'
});

module.exports = {
    Employee,
    Project,
    ProjectAssignee,
    Interview,
    Applicant,
    InterviewStage,
    StageLookup,
    Interviewer,
    Job
};