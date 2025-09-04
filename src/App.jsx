import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import JobPosting from './components/JobPosting';
import ManageJobPostings from './components/JobManagement';
import RecruitingDashboard from './components/interview_tracking';
import EmployeeDashboard from './components/EmployeeDashboard';
import OnboardingChecklist from './components/OnboardingChecklist';
import EditJob from './components/EditJob.jsx';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/protectedroutes';   // Import your ProtectedRoute
import AdminCenter from './components/AdminCenter';
import Settings from './components/Settings';
import JobListing from './components/joblisting';
import EmployeeDetails from './components/resourcetracker/EmployeeDetails';
import ResourceTracker from './components/resourcetracker/ResourceTracker.jsx';
import ConsolidatedTracker from './components/resourcetracker/ConsolidatedTracker';
import UtilizationReport from './components/resourcetracker/UtilizationReport';
import EmployeeList from './components/resourcetracker/EmployeeList';
import AvailableTeamMembers from './components/resourcetracker/AvailableTeamMembers';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeDashboard />} />
            <Route path="/manage" element={<ManageJobPostings />} />
            <Route path="/projects" element={<Dashboard />} /> 
            <Route path="/joblisting/:jobId" element={<JobListing />} />
            <Route path="/jobposting" element={<JobPosting />} />
            <Route path="/interview-status/:jobId" element={<RecruitingDashboard />} />
            <Route path="/interview-tracking/:applicantId" element={<RecruitingDashboard />} />
            <Route path="/onboarding/:employeeId" element={<OnboardingChecklist />} />
            <Route path="/edit-job/:jobId" element={<EditJob />} />
            <Route path="/admin-center" element={<AdminCenter />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
            <Route path="/employee-dashboard" element={<EmployeeDetails />} />
            <Route path="/tracker/:id" element={<ResourceTracker />} />
            <Route path="/consolidated" element={<ConsolidatedTracker />} />
            <Route path="/report" element={<UtilizationReport />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/available" element={<AvailableTeamMembers />} />
        </Route>

        {/* Fallback: redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
