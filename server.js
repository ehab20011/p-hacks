const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');

// Load environment variables from the .env file
dotenv.config();
const app = express();

// Enable CORS before routes
app.use(cors());

// Import the model at the top so it is accessible throughout the file
const RefuModel = require('./mongo_models/model');

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => console.error('MongoDB connection failed:', err));
  

// Parse JSON
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// POST API route to handle login
// POST API route to handle login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt with email:', email);

  try {
    // Find the refugee by email (case-insensitive search)
    const refugee = await RefuModel.findOne({ email: { $regex: new RegExp(email, "i") } });
    
    if (!refugee) {
      console.log(`Refugee not found for email: ${email}`);
      return res.status(404).json({ message: 'Refugee not found' });
    }

    console.log('Refugee found:', refugee.name);

    // Plain text password comparison
    if (password !== refugee.password) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful');
    res.json({
      message: 'Login successful',
      refugee: {
        name: refugee.name,
        email: refugee.email,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});



// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Run the server on port 5000 (or a different port if needed)
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
