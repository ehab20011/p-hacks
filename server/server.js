const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require("bcrypt");
const path = require('path');

// Load environment variables
dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 60000, })
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

// WebSocket setup
const activeUsers = new Map();

wss.on('connection', function(socket) {
  socket.on('message', function incoming(message) {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'login':
        handleLogin(socket, data.payload);
        break;
      case 'send_message':
        handleSendMessage(data.payload);
        break;
    }
  });

  socket.on('close', () => {
    console.log('Socket closed');
    const userId = getUserIdBySocket(socket);
    if (userId) {
      activeUsers.delete(userId);
      broadcastActiveUsers();
      console.log(`${userId} disconnected`);
    }
  });
});

function handleLogin(socket, user) {
  activeUsers.set(user.id, { socket, ...user });
  socket.user = user;
  activeUsers.set(user.id, { socket, ...user });
  console.log(`${user.name} is connected`);
  broadcastActiveUsers();
}

function handleSendMessage(message) {
  const { senderId, receiverId, text, file } = message;

  // Store the message in MongoDB
  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    file: file ? {
      name: file.name,
      type: file.type,
      data: file.data,
    } : null,
  });

  newMessage.save()
    .then(() => console.log('Message stored in DB'))
    .catch(err => console.error('Error saving message to DB:', err));

  // Send the message to the receiver
  const receiverSocket = activeUsers.get(receiverId)?.socket;
  if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
    receiverSocket.send(JSON.stringify({
      type: 'new_message',
      payload: { senderId, text, file }
    }));
  }
}

function broadcastActiveUsers() {
  const users = Array.from(activeUsers.values()).map(({ id, name, role }) => ({ id, name, role }));
  const message = JSON.stringify({ type: 'active_users', payload: users });
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function getUserIdBySocket(socket) {
  for (let [userId, user] of activeUsers) {
    if (user.socket === socket) {
      return userId;
    }
  }
  return null;
}

//Testing Purposes
// Endpoint to test environment variables
app.get('/api/debug/env', (req, res) => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGO_URI is not defined');
    return res.status(500).json({ message: 'MONGO_URI is not defined in environment variables' });
  }
  console.log('✅ MONGO_URI is defined:', process.env.MONGODB_URI);
  res.json({ message: 'MONGO_URI is defined', uri: process.env.MONGODB_URI });
});
// Endpoint to test MongoDB connection state
app.get('/api/debug/mongo-state', (req, res) => {
  const connectionState = mongoose.connection.readyState;
  const connectionStatus = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  console.log(`MongoDB Connection State: ${connectionStatus[connectionState]}`);
  res.json({
    state: connectionState,
    status: connectionStatus[connectionState],
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await mongoose.connection.db.admin().ping();
    res.json({ message: 'The MONGODB Database connection is working!', result });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection error', error });
  }
});
app.get('/api/db-debug', async (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    const connectionStatus = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    console.log(`MongoDB Connection State: ${connectionStatus[connectionState]}`);
    
    if (connectionState !== 1) {
      throw new Error(`Connection not established: ${connectionStatus[connectionState]}`);
    }

    // Perform a simple admin command to confirm
    const result = await mongoose.connection.db.admin().ping();
    res.json({ message: 'MongoDB is working!', result });
  } catch (error) {
    console.error('MongoDB debug error:', error.message);
    res.status(500).json({ message: 'Database debug error', error: error.message });
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
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// 404 for Undefined Routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
