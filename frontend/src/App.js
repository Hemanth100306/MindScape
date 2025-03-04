import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Symptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Fetch symptoms from the backend
    axios.get('http://localhost:5004/symptoms') // Corrected endpoint
      .then(response => {
        setSymptoms(response.data); // Set the fetched symptoms to state
      })
      .catch(error => {
        console.error(error);
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
    axios.post('http://localhost:5004/symptoms', { symptoms: selectedSymptoms }) // ✅ Correct endpoint
      .then(response => {
        console.log('Symptoms submitted:', response.data);
        // Optional: Redirect after successful submission
        window.location.href = "/results"; 
      })
      .catch(error => {
        console.error('Error submitting symptoms:', error);
      });
};


  // Filter symptoms based on selected category
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

      {filteredSymptoms.length > 0 ? (
        filteredSymptoms.map(symptom => (
          <div key={symptom._id} className="symptom-item">
            <label>
              <input
                type="checkbox"
                onChange={(event) => handleCheckboxChange(event, symptom)}
              />
              {symptom.name} - {symptom.category}
            </label>
          </div>
        ))
      ) : (
        <p>No symptoms available</p>
      )}
      
      <button onClick={handleSubmit}>Submit Symptoms</button>
    </div>
  );
}

export default Symptoms;