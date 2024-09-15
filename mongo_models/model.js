const mongoose = require('mongoose');

// Refugee Schema
const refugeeSchema = new mongoose.Schema({
  name: String,
  email:  String, // Email 
  password: String, // Password should be hashed before saving (smd gpt)
  age: Number,
  gender: String,
  familyMembers: Number,
  encampment: String,
  language: String,
  dateOfBirth: Date,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now }  // Fix here: Use Date.now instead of Date.Now
});

// Worker Schema (for workers)
const workerSchema = new mongoose.Schema({
  name: String,           // First and last name combined
  email: String, // Email must be unique
  password: String,       // Hashed password (remember to hash it before saving)
  role: String,           // Job title (doctor, nurse, etc.)
  encampment: String,     // Camp location or reference
  language: String,      // Optional language field
  dateOfBirth: Date,     // Date of birth
  gender: String,        // Optional gender field
  phoneNumber: String,    // Phone number
  idNumber: String,       // ID number
  createdAt: { type: Date, default: Date.now }  // Fix here: Use Date.now instead of Date.Now
}, { timestamps: true });                           // Automatically adds createdAt and updatedAt fields

// No more password hashing before saving

// Message Schema
const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  text: String,
  file: {
    name: String,
    type: String,
    data: String, // Base64 encoded
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Refugee: mongoose.model('Refugee', refugeeSchema, 'Refugees'),
  Worker: mongoose.model('Worker', workerSchema),
  Message: mongoose.model('Message', messageSchema, 'Messages')
};

