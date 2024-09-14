import React, { useEffect, useState } from 'react';

function RefugeePage() {
  const [refugeeName, setRefugeeName] = useState('');

  useEffect(() => {
    // Get the refugee's name from localStorage (or wherever you saved it)
    const name = localStorage.getItem('refugeeName');
    setRefugeeName(name);
  }, []);

  return (
    <div>
      <h1>Refugee Dashboard</h1>
      <p>Logged in as: {refugeeName}</p>
    </div>
  );
}

export default RefugeePage;
