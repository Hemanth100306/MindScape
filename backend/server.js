const express = require('express');
const mongoose = require('mongoose');
const Symptom = require('./models/Symptom'); // Make sure this is the correct path
require('dotenv').config();

const app = express();
const port = 5004; // Use your correct port number
const cors = require('cors');
app.use(cors());
const symptomRoutes = require('./routes/symptomRoutes');
app.use('/symptoms', symptomRoutes);

// Middleware to parse JSON requests
app.use(express.json());
const chatbotRoutes = require("./routes/chatbotRoutes");
app.use("/api/chatbot", chatbotRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Route to get symptoms from the database
app.get('/symptoms', async (req, res) => {
  try {
    // Fetch symptoms from the database
    const symptoms = await Symptom.find();
    
    // If no symptoms found, send an error
    if (!symptoms) {
      return res.status(404).json({ message: 'No symptoms found' });
    }

    // Return the symptoms as JSON
    res.json(symptoms);
  } catch (err) {
    console.error('Error fetching symptoms:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to submit symptoms
app.post('/submit-symptoms', (req, res) => {
  const { symptoms } = req.body;
  console.log('Symptoms submitted:', symptoms);
  res.status(200).json({ message: 'Symptoms submitted successfully' });
});

// Server listening on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
