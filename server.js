const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use(cors());

const { Refugee, Worker } = require('./mongo_models/model');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected with id:', socket.id);

  socket.on('login', async ({ email, role }) => {
    let user;
    if (role === 'refugee') {
      user = await Refugee.findOne({ email });
    } else if (role === 'worker') {
      user = await Worker.findOne({ email });
    }

    if (user) {
      activeUsers.set(socket.id, { id: user._id, email: user.email, role });
      socket.emit('login_success', { id: user._id, name: user.name, email: user.email, role });
      io.emit('user_list', Array.from(activeUsers.values()));
    } else {
      socket.emit('login_error', 'User not found');
    }
  });

  socket.on('send_message', (data) => {
    console.log("Message received:", data);
    const sender = activeUsers.get(socket.id);
    if (sender) {
      io.to(data.receiverId).emit('receive_message', {
        ...data,
        senderId: sender.id,
        senderEmail: sender.email,
        senderRole: sender.role
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    activeUsers.delete(socket.id);
    io.emit('user_list', Array.from(activeUsers.values()));
  });
});


// POST Refugee signup route
app.post('/api/signup/Refugee', async (req, res) => {
  const { name, email, password, age, gender, familyMembers, encampment, language, dateOfBirth, phoneNumber } = req.body;

  try {
    // Check if the refugee already exists by email
    const existingRefugee = await Refugee.findOne({ email });
    if (existingRefugee) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create a new refugee document
    const newRefugee = new Refugee({
      name,
      email,
      password,  // Remember to hash the password later using bcrypt
      age,
      gender,
      familyMembers,
      encampment,
      language,
      dateOfBirth,
      phoneNumber
    });

    // Save refugee to the database
    await newRefugee.save();
    res.status(201).json({ message: 'Refugee registered successfully', refugee: newRefugee });
  } catch (error) {
    console.error('Error registering refugee:', error);
    res.status(500).json({ message: 'Server error during refugee registration', error });
  }
});

// POST Worker signup route
app.post('/api/signup/worker', async (req, res) => {
  const { name, email, password, role, encampment, language, dateOfBirth, gender, phoneNumber, idNumber } = req.body;

  try {
    // Check if the worker already exists by email
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create a new worker document
    const newWorker = new Worker({
      name,
      email,
      password,  // Remember to hash the password later using bcrypt
      role,
      encampment,
      language,
      dateOfBirth,
      gender,
      phoneNumber,
      idNumber
    });

    // Save worker to the database
    await newWorker.save();
    res.status(201).json({ message: 'Worker registered successfully', worker: newWorker });
  } catch (error) {
    console.error('Error registering worker:', error);
    res.status(500).json({ message: 'Server error during worker registration', error });
  }
});

// POST API route to handle login
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  console.log(`Login attempt with email: ${email} Role: ${role}`);

  try {
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

// Ensure all API routes are defined before this route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
