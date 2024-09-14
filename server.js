const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();
const app = express();

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    
    // Import the model AFTER the connection is established
    const RefuModel = require('./mongo_models/model');

    // Test query to check if refugee exists
    try {
      const testRefugee = await RefuModel.findOne({ email: "mohammed.ali@example.com" });
      if (testRefugee) {
        console.log('Test refugee found:', testRefugee);
      } else {
        console.log('Test refugee NOT found');
      }
    } catch (err) {
      console.error('Error during test query:', err);
    }
  })
  .catch(err => console.error('MongoDB connection failed:', err));

// Parse JSON
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API route to test MongoDB connection
app.get('/api/data', async (req, res) => {
  try {
    const data = await RefuModel.find(); // Query using your model
    res.json(data);
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
    res.status(500).json({ message: 'Error fetching data from the database' });
  }
});

// POST API route to handle login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(`Login attempt with email: ${email}`);
  
  try {
    const refugee = await RefuModel.findOne({ email: { $regex: new RegExp(email, "i") } });

    if (!refugee) {
      console.log(`Refugee not found for email: ${email}`);
      return res.status(404).json({ message: 'Refugee not found' });
    }

    if (password === refugee.password) {
      console.log(`Login successful for refugee: ${refugee.name}`);
      res.json({
        message: 'Login successful',
        refugee: {
          name: refugee.name,
          email: refugee.email,
        },
      });
    } else {
      console.log(`Invalid password for refugee: ${refugee.name}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error("Error during login:", err);
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
