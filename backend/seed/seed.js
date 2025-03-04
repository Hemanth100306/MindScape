const mongoose = require('mongoose');
const Symptom = require('../models/Symptom');  // Ensure correct path
require('dotenv').config();

const symptomsList = [
  { name: "Fever", category: "general" },
  { name: "Chills", category: "general" },
  { name: "Fatigue", category: "general" },
  { name: "Weakness", category: "general" },
  { name: "Dizziness", category: "general" },
  { name: "Sweating", category: "general" },
  { name: "Cough (dry or wet)", category: "respiratory" },
  { name: "Shortness of breath", category: "respiratory" },
  { name: "Sore throat", category: "respiratory" },
  { name: "Runny nose", category: "respiratory" },
  { name: "Sneezing", category: "respiratory" },
  { name: "Chest pain", category: "respiratory" },
  { name: "Wheezing", category: "respiratory" },
  { name: "Nausea", category: "digestive" },
  { name: "Vomiting", category: "digestive" },
  { name: "Diarrhea", category: "digestive" },
  { name: "Constipation", category: "digestive" },
  { name: "Stomach pain", category: "digestive" },
  { name: "Acid reflux", category: "digestive" },
  { name: "Bloating", category: "digestive" },
  { name: "Headache", category: "neurological" },
  { name: "Confusion", category: "neurological" },
  { name: "Numbness", category: "neurological" },
  { name: "Tingling", category: "neurological" },
  { name: "Memory loss", category: "neurological" },
  { name: "Rash", category: "skin" },
  { name: "Itching", category: "skin" },
  { name: "Swelling", category: "skin" },
  { name: "Redness", category: "skin" },
  { name: "Dry skin", category: "skin" },
  { name: "Muscle pain", category: "muscular" },
  { name: "Joint pain", category: "muscular" },
  { name: "Stiffness", category: "muscular" },
  { name: "Swelling in joints", category: "muscular" },
  { name: "Anxiety", category: "mental" },
  { name: "Depression", category: "mental" },
  { name: "Mood swings", category: "mental" },
  { name: "Difficulty sleeping", category: "mental" },
  { name: "Panic attacks", category: "mental" }
];

async function seedSymptoms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected successfully');

    // Clear previous data
    await Symptom.deleteMany({});
    console.log('🗑️  Existing symptoms deleted');

    // Insert new symptoms
    await Symptom.insertMany(symptomsList);
    console.log('✅ Database successfully seeded with symptoms');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close(); // Ensure the connection is closed
  }
}

// Execute the function
seedSymptoms();
