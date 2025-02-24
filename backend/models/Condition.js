const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    name: String,
    description: String,
    remedies: [String]
});

module.exports = mongoose.model('Condition', conditionSchema);
