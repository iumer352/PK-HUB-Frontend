import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddEmployee from './components/AddEmployee';
import ViewEmployees from './components/ViewEmployees';
import JobPosting from './components/JobPosting';
import ManageJobPostings from './components/JobManagement';
import JobPostingForm from './components/joblisting';
import RecruitingDashboard from './components/interview_tracking';
import ProjectDashboard from './components/projectDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeDashboard />} />
          <Route path="/projectDashboard" element={<ProjectDashboard />} />
          <Route path="/manage" element={<ManageJobPostings />} />
          <Route path="/projects" element={<Dashboard />} /> 
          <Route path="/joblisting/:jobId" element={<JobPostingForm />} />
          <Route path="/jobposting" element={<JobPosting />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/view-employees" element={<ViewEmployees />} />
          <Route path="/interview-status/:jobId" element={<RecruitingDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
