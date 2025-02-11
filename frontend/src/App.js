import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Symptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [filter, setFilter] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // API request to the backend
    axios.get('http://localhost:5006/api/status')  // This should match your backend's API URL
      .then(response => {
        setStatusMessage(response.data.message);  // Display the status message from backend
      })
      .catch(error => {
        console.error('Error fetching status: ', error);
        setStatusMessage("Failed to connect to backend");
      });

    // Fetch symptoms from the backend
    axios.get('http://localhost:5006/symptoms')
      .then(response => {
        setSymptoms(response.data);
      })
      .catch(error => {
        console.error('Error fetching symptoms: ', error);
      });
  }, []);

  const handleCheckboxChange = (event, symptom) => {
    if (event.target.checked) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    } else {
      setSelectedSymptoms(selectedSymptoms.filter(item => item._id !== symptom._id));
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSubmit = () => {
    console.log('Selected Symptoms:', selectedSymptoms);
    axios.post('http://localhost:5006/api/symptoms', { symptoms: selectedSymptoms })
      .then(response => {
        console.log('Symptoms submitted:', response.data);
      })
      .catch(error => {
        console.error('Error submitting symptoms:', error);
      });
  };

  const filteredSymptoms = filter === 'All' ? symptoms : symptoms.filter(symptom => symptom.category === filter);

  return (
    <div>
      <h2>Symptoms</h2>
      <div className="filter-section">
        <label>Filter by Category:</label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="general">General</option>
          <option value="respiratory">Respiratory</option>
          <option value="digestive">Digestive</option>
          <option value="neurological">Neurological</option>
          <option value="skin">Skin</option>
          <option value="muscular">Muscular</option>
          <option value="mental">Mental</option>
        </select>
      </div>
      {filteredSymptoms.map(symptom => (
        <div key={symptom._id} className="symptom-item">
          <label>
            <input
              type="checkbox"
              onChange={(event) => handleCheckboxChange(event, symptom)}
            />
            {symptom.name} - {symptom.category}
          </label>
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Symptoms</button>
    </div>
  );
}

function App() {
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <div className="App">
      <h1>MindScape</h1>
      <p>{statusMessage}</p>
      <Symptoms />
    </div>
  );
}

export default App;
