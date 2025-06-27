const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  skills: [String],
  goal: String,
  roadmap: [String],
  progress: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);