const mongoose = require('mongoose');

const refugeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  age: Number,
  gender: String,
  familyMembers: Number,
  encampment: String,
  language: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

// No more password hashing before saving

const RefuModel = mongoose.model('Refugee', refugeeSchema, 'Refugees');

module.exports = RefuModel;