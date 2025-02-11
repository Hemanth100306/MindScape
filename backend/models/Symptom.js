const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: String,
  category: String
});

module.exports = mongoose.model('Symptom', symptomSchema);
