const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }
});

const Symptom = mongoose.model('Symptom', symptomSchema);

module.exports = Symptom;
