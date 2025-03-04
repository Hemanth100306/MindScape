const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom'); // Import the model

// @route   GET /api/symptoms
// @desc    Get all symptoms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const symptoms = await Symptom.find({});
    res.status(200).json(symptoms);
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
