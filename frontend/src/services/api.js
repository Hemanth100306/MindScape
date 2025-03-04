import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getSymptoms = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/symptoms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return [];
  }
};
