// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import necessary packages
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Symptom = require('./models/Symptom');

// 3. Create the Express app
const app = express();

// 4. Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS

// 5. Connect to MongoDB
connectDB();

// 6. Define Routes
// Root Route
app.get("/", (req, res) => {
  res.send("Hello from MindScape!");
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "Server is healthy!", timestamp: new Date() });
});

// API Status Check
app.get('/api/status', (req, res) => {
  res.json({ message: "MindScape API is running!" });
});

// API route to fetch symptoms
app.get('/symptoms', async (req, res) => {
  try {
    const symptoms = await Symptom.find();
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching symptoms" });
  }
});
// Add a POST route to receive selected symptoms
app.post('/api/symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body; // Expecting an array of selected symptoms
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: "No symptoms provided" });
    }

    console.log("Received symptoms:", symptoms); // Log to check if the data is received

    // Process the symptoms (e.g., store them, match with conditions, etc.)
    res.json({ message: "Symptoms received successfully", symptoms });
  } catch (err) {
    res.status(500).json({ error: "Error processing symptoms" });
  }
});

// 7. Start the server
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));