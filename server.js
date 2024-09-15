const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Import models
const { Refugee, Worker, Message } = require('./mongo_models/model');

// WebSocket setup
const activeUsers = new Map();

wss.on('connection', function(socket) {
  console.log('A user connected');

  socket.on('message', function incoming(message) {
    const data = JSON.parse(message);
    console.log('Received:', data);

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
    const userId = getUserIdBySocket(socket);
    if (userId) {
      activeUsers.delete(userId);
      broadcastActiveUsers();
    }
    console.log('A user disconnected');
  });
});

function handleLogin(socket, user) {
  activeUsers.set(user.id, { socket, ...user });
  socket.userId = user.id;
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

// POST Refugee signup route
app.post('/api/signup/Refugee', async (req, res) => {
  const { name, email, password, age, gender, familyMembers, encampment, language, dateOfBirth, phoneNumber } = req.body;
  try {
    const existingRefugee = await Refugee.findOne({ email });
    if (existingRefugee) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const newRefugee = new Refugee({
      name,
      email,
      password,  // Hash the password with bcrypt later for security
      age,
      gender,
      familyMembers,
      encampment,
      language,
      dateOfBirth,
      phoneNumber
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

    const newWorker = new Worker({
      name,
      email,
      password,  // Hash the password with bcrypt later for security
      role,
      encampment,
      language,
      dateOfBirth,
      gender,
      phoneNumber,
      idNumber
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
    const user = { id: Date.now().toString(), name: email.split('@')[0], email, role };
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST API route to handle message loading
app.post('/api/getMessages', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 }); // Sort by date to get the correct order
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Serve static files for the React app
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
