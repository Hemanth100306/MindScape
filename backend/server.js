// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import necessary packages
const express = require('express');
const mongoose = require('mongoose');

// 3. Create the Express app
const app = express();

// 4. Middleware, routes, and other configurations can go here
// For example, middleware for handling JSON requests
app.use(express.json()); // For parsing application/json

// 5. Connect to MongoDB using the MONGO_URI from the .env file
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error: ', err));

// 6. Set up your server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Example route
app.get("/", (req, res) => {
  res.send("Hello from MindScape!");
});

// Add additional routes as necessary
app.get('/api/status', (req, res) => {
  res.json({ message: "MindScape API is running!" });
});
