import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const refugeeName = localStorage.getItem('refugeeName');
  const employeeName = localStorage.getItem('employeeName');

  // Check if either a refugee or employee is logged in
  const isAuthenticated = !!refugeeName || !!employeeName;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
