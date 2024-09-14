import React from 'react';
import { useNavigate } from 'react-router-dom';

function EmployeePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage data
    navigate('/login'); // Redirect to login page
  };

  return (
    <div>
      <h1>Welcome to the Employee Page!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default EmployeePage;
