import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Symptoms = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // To manage category filter

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get('http://localhost:5004/symptoms');
        setSymptoms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching symptoms');
        setLoading(false);
      }
    };

    fetchSymptoms();
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSelectedSymptoms((prevState) =>
      checked
        ? [...prevState, name]
        : prevState.filter((symptom) => symptom !== name)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5004/submit-symptoms', {
        symptoms: selectedSymptoms,
      });
      alert('Symptoms submitted successfully');
    } catch (err) {
      alert('Error submitting symptoms');
    }
  };

  const handleFilterChange = (e) => {
    setCategoryFilter(e.target.value); // Update filter value based on dropdown selection
  };

  // Filter symptoms based on selected category
  const filteredSymptoms = symptoms.filter(
    (symptom) => categoryFilter === 'all' || symptom.category === categoryFilter
  );

  console.log(filteredSymptoms);  // This will log the filtered symptoms to the console

  if (loading) return <div>Loading symptoms...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Symptoms</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Filter by Category: </label>
          <select onChange={handleFilterChange} value={categoryFilter}>
            <option value="all">All</option>
            <option value="general">General</option>
            <option value="respiratory">Respiratory</option>
            <option value="digestive">Digestive</option>
            <option value="neurological">Neurological</option>
            <option value="skin">Skin</option>
            <option value="muscular">Muscular</option>
            <option value="mental">Mental</option>
          </select>
        </div>

        <ul>
          {filteredSymptoms.map((symptom) => (
            <li key={symptom._id}>
              <label>
                <input
                  type="checkbox"
                  name={symptom.name}
                  onChange={handleCheckboxChange}
                />
                {symptom.name} - {symptom.category}
              </label>
            </li>
          ))}
        </ul>

        <button type="submit">Submit Symptoms</button>
      </form>
    </div>
  );
};

export default Symptoms;