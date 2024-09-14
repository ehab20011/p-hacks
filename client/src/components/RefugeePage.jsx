import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RefugeePage() {
  const [refugeeName, setRefugeeName] = useState('');
  const [loading, setLoading] = useState(true); // For loading state
  const navigate = useNavigate(); // For navigation (e.g., redirecting)

  useEffect(() => {
    // Get the refugee's name from localStorage (or wherever you saved it)
    const name = localStorage.getItem('refugeeName');
    
    if (name) {
      setRefugeeName(name); // Set the refugee's name
    } else {
      navigate('/login'); // Redirect to login if no name is found
    }
    setLoading(false); // Stop loading once done
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage data
    navigate('/login'); // Redirect to login page
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading message while checking localStorage
  }

  return (
    <div>
      <h1>Refugee Dashboard</h1>
      <p>Logged in as: {refugeeName}</p>
      <button onClick={handleLogout}>Logout</button> {/* Logout Button */}
    </div>
  );
}

export default RefugeePage;
