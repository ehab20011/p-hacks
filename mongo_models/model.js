const mongoose = require('mongoose');

const refugeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // Email 
  password: { type: String, required: true }, // Password should be hashed before saving (smd gpt)
  age: Number,
  gender: String,
  familyMembers: Number,
  encampment: String,
  language: String,
  dateOfBirth: Date,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now }
});

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },           // First and last name combined
  email: { type: String, required: true }, // Email must be unique
  password: { type: String, required: true },       // Hashed password (remember to hash it before saving)
  role: { type: String, required: true },           // Job title (doctor, nurse, etc.)
  encampment: { type: String, required: true },     // Camp location or reference
  language: { type: String, required: false },      // Optional language field
  dateOfBirth: { type: Date, required: true },      // Date of birth
  gender: { type: String, required: false },        // Optional gender field
  phoneNumber: { type: String, required: true },    // Phone number
  idNumber: { type: String, required: true },       // ID number
  createdAt: { type: Date, default: Date.now },     // Automatically set the created date
}, { timestamps: true });                           // Automatically adds createdAt and updatedAt fields

// No more password hashing before saving

// Export both models
module.exports = {
  Refugee: mongoose.model('Refugee', refugeeSchema),
  Worker: mongoose.model('Worker', workerSchema)
};