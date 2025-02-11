import React, { useState, useEffect } from 'react';
import axios from 'axios';
const Symptoms = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get('http://localhost:5006/symptoms') // Change port to 5002
        setSymptoms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching symptoms');
        setLoading(false);
      }
    };
    fetchSymptoms();
  }, []);
  if (loading) return <div>Loading symptoms...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div>
      <h1>Symptoms</h1>
      <ul>
        {symptoms.map((symptom) => (
          <li key={symptom._id}>
            <strong>{symptom.name}</strong> - {symptom.category}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Symptoms;