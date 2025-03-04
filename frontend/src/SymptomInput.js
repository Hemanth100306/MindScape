import React, { useState, useEffect } from 'react';
import { getSymptoms } from '../services/api'; // Import API function

const SymptomInput = ({ onSymptomSelect }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState('');

  useEffect(() => {
    async function fetchSymptoms() {
      const data = await getSymptoms();
      setSymptoms(data);
    }
    fetchSymptoms();
  }, []);

  const handleChange = (event) => {
    setSelectedSymptom(event.target.value);
    onSymptomSelect(event.target.value);
  };

  return (
    <div>
      <label>Select a Symptom:</label>
      <select value={selectedSymptom} onChange={handleChange}>
        <option value="">-- Choose --</option>
        {symptoms.map((symptom) => (
          <option key={symptom._id} value={symptom.name}>
            {symptom.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SymptomInput;
