import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // API request to the backend
    axios.get('http://localhost:5000/api/status')  // This should match your backend's API URL
      .then(response => {
        setStatusMessage(response.data.message);  // Display the status message from backend
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
        setStatusMessage("Failed to connect to backend");
      });
  }, []);

  return (
    <div className="App">
      <h1>MindScape</h1>
      <p>{statusMessage}</p>
    </div>
  );
}

export default App;
