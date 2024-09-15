const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed:', err));

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
  const receiverSocket = activeUsers.get(receiverId)?.socket;
  if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
    receiverSocket.send(JSON.stringify({
      type: 'new_message',
      payload: { senderId, text, file } // Include the file in the payload if present
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

app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    // This is a placeholder. In a real app, you'd validate against your database
    const user = { id: Date.now().toString(), name: email.split('@')[0], email, role };
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));