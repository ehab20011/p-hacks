import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if either a refugee or employee is logged in
  const userName = localStorage.getItem('userName');
  const isAuthenticated = !!userName; // Converts to boolean

  console.log("PrivateRoute: isAuthenticated =", isAuthenticated, "userName =", userName);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
