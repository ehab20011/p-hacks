const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());

// Import the models correctly
const { Refugee, Worker } = require('./mongo_models/model');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

// POST API route to handle login
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  console.log(`Login attempt with email: ${email} Role: ${role}`);

  try {
    // Ensure you're using the correct model for refugee
    const refugee = await Refugee.findOne({ email: email.trim() });

    if (!refugee) {
      console.log(`Refugee not found for email: ${email}`);
      return res.status(404).json({ message: 'Refugee not found' });
    }

    console.log('Refugee found:', refugee.name);

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
