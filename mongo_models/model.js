const mongoose = require('mongoose');

// Refugee Schema
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
  createdAt: { type: Date, default: Date.now },
});

// Explicitly specify the collection name as 'Refugees'
const Refugee = mongoose.model('Refugee', refugeeSchema, 'Refugees');

// Worker Schema (for workers)
const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  encampment: { type: String, required: true },
  language: { type: String, required: false },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  idNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Explicitly specify the collection name as 'Workers'
const Worker = mongoose.model('Worker', workerSchema, 'Workers');

// Export both models
module.exports = { Refugee, Worker };
