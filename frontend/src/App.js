import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Symptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Fetch symptoms from the backend
    axios.get('http://localhost:5001/symptoms')
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
    axios.post('http://localhost:5001/api/symptoms', { symptoms: selectedSymptoms })
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

export default Symptoms;
