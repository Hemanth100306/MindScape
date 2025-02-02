const mongoose = require('mongoose');
const Symptom = require('../models/Symptom');
require('dotenv').config();

const symptomsList = [
  // General Symptoms
  { name: "Fever", category: "general" },
  { name: "Chills", category: "general" },
  { name: "Fatigue", category: "general" },
  { name: "Weakness", category: "general" },
  { name: "Dizziness", category: "general" },
  { name: "Sweating", category: "general" },

  // Respiratory Symptoms
  { name: "Cough (dry or wet)", category: "respiratory" },
  { name: "Shortness of breath", category: "respiratory" },
  { name: "Sore throat", category: "respiratory" },
  { name: "Runny nose", category: "respiratory" },
  { name: "Sneezing", category: "respiratory" },
  { name: "Chest pain", category: "respiratory" },
  { name: "Wheezing", category: "respiratory" },

  // Digestive Symptoms
  { name: "Nausea", category: "digestive" },
  { name: "Vomiting", category: "digestive" },
  { name: "Diarrhea", category: "digestive" },
  { name: "Constipation", category: "digestive" },
  { name: "Stomach pain", category: "digestive" },
  { name: "Acid reflux", category: "digestive" },
  { name: "Bloating", category: "digestive" },

  // Neurological Symptoms
  { name: "Headache", category: "neurological" },
  { name: "Dizziness", category: "neurological" },
  { name: "Confusion", category: "neurological" },
  { name: "Numbness", category: "neurological" },
  { name: "Tingling", category: "neurological" },
  { name: "Memory loss", category: "neurological" },

  // Skin-Related Symptoms
  { name: "Rash", category: "skin" },
  { name: "Itching", category: "skin" },
  { name: "Swelling", category: "skin" },
  { name: "Redness", category: "skin" },
  { name: "Dry skin", category: "skin" },

  // Muscular & Joint Symptoms
  { name: "Muscle pain", category: "muscular" },
  { name: "Joint pain", category: "muscular" },
  { name: "Stiffness", category: "muscular" },
  { name: "Swelling in joints", category: "muscular" },

  // Mental Health Symptoms
  { name: "Anxiety", category: "mental" },
  { name: "Depression", category: "mental" },
  { name: "Mood swings", category: "mental" },
  { name: "Difficulty sleeping", category: "mental" },
  { name: "Panic attacks", category: "mental" }
];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    return Symptom.deleteMany(); // Delete any existing symptoms
  })
  .then(() => {
    console.log('Existing symptoms deleted.');
    return Symptom.insertMany(symptomsList); // Insert the new symptoms
  })
  .then(() => {
    console.log('Database seeded with symptoms!');
    mongoose.connection.close(); // Close the connection
  })
  .catch(err => {
    console.error('Error seeding data:', err);
  });
