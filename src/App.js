import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AddEmployee from './components/AddEmployee';
import ViewEmployees from './components/ViewEmployees';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ViewEmployees />} />
          <Route path="/employees" element={<ViewEmployees />} />
          <Route path="/add-employee" element={<AddEmployee />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
