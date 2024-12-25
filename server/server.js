const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require("bcrypt");
const path = require('path');
const Ably = require('ably');


// Load environment variables
dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB:', err.message);
    if (err.reason) {
      console.error('Reason:', err.reason);
    }
    if (err.stack) {
      console.error('Stack Trace:', err.stack);
    }
    console.error('Full error details:', err);
  });
// Log MongoDB connection states
mongoose.connection.on('connecting', () => {
  console.log('🔄 MongoDB: Connecting...');
});
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB: Connected');
});
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB: Disconnected');
});
mongoose.connection.on('reconnectFailed', () => {
  console.error('❌ MongoDB: Reconnection failed');
});
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB: Connection error', error.message);
});

// Import models
const { Refugee, Worker, Message } = require('./mongo_models/model');

// Initialize Ably
const ably = new Ably.Realtime(process.env.ABLY_API_KEY);

// Set up the "chat" channel
const chatChannel = ably.channels.get("chat");

// Handle Ably messaging
chatChannel.subscribe('message', (msg) => {
  console.log('Message received:', msg.data);
});


//Testing Purposes
//Endpoint to test environment variables
app.get('/api/debug/env', (req, res) => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined');
    return res.status(500).json({ message: 'MONGO_URI is not defined in environment variables' });
  }
  console.log('✅ MONGO_URI is defined:', process.env.MONGO_URI);
  res.json({ message: 'MONGO_URI is defined', uri: process.env.MONGO_URI });
});
app.get('/api/db-debug', async (req, res) => {
  try {
      console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
      
      const connectionState = mongoose.connection.readyState;
      const connectionStatus = {
          0: 'Disconnected',
          1: 'Connected',
          2: 'Connecting',
          3: 'Disconnecting'
      };
      console.log(`MongoDB Connection State: ${connectionStatus[connectionState]}`);
      
      // wait function ig
      if (connectionState === 2) {
          await new Promise((resolve, reject) => {
              mongoose.connection.once('connected', resolve);
              mongoose.connection.once('error', reject);
              setTimeout(() => reject(new Error('Connection timeout')), 5000);
          });
      }
      
      // let's try to list collections without admin privileges
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      res.json({
          status: 'success',
          connectionState: connectionStatus[mongoose.connection.readyState],
          collections: collections.map(col => col.name),
          databaseName: mongoose.connection.db.databaseName
      });
  } catch (error) {
      console.error('Database debug error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
      });
      
      res.status(500).json({
          status: 'error',
          error: error.message,
          connectionState: mongoose.connection.readyState,
          envVarExists: !!process.env.MONGODB_URI
      });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// POST Refugee signup route
app.post('/api/signup/refugee', async (req, res) => {
  const { name, email, password, ...rest } = req.body;
  try {
    const existingRefugee = await Refugee.findOne({ email });
    if (existingRefugee) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const newRefugee = new Refugee({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      ...rest,
    });

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
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const newWorker = new Worker({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      role,
      encampment,
      language,
      dateOfBirth,
      gender,
      phoneNumber,
      idNumber,
    });

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

  try {
    const model = role === "refugee" ? Refugee : Worker;

    const normalizedEmail = email.trim();
    const user = await model.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Respond with user details
    res.json({
      id: user._id,
      name: user.name,
      role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST API route to handle message loading
app.post('/api/getMessages', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const messages = await Message.find({
      $or: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Endpoint to publish messages via Ably
app.post('/api/sendMessage', async (req, res) => {
  const { senderId, receiverId, text, file } = req.body;

  try {
    // Store the message in MongoDB
    const newMessage = new Message({ senderId, receiverId, text, file });
    await newMessage.save();

    // Publish the message via Ably
    chatChannel.publish('message', { senderId, receiverId, text, file });
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// 404 for Undefined Routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
