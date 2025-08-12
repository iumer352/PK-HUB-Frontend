import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    // If user info is missing, treat as unauthenticated or redirect to login
    return <Navigate to="/login" replace />;
  }

  // Role-based route restriction for 'resource'
  if (user.role === 'user') {
    // Allowed routes for resource role
    const allowedRoutes = [
      '/employee-dashboard',
      '/tracker',
      '/consolidated',
      '/report',
      '/employees',
      '/available',
    ];

    // Check if current path starts with any allowed route
    const isAllowed = allowedRoutes.some((path) => location.pathname.startsWith(path));

    if (!isAllowed) {
      // Redirect resource user to their dashboard if they try to access forbidden routes
      return <Navigate to="/employee-dashboard" replace />;
    }
  }

  // If no restrictions apply, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
