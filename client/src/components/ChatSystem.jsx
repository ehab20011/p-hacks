import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./styles/ChatSystem.css";
import NavBar from "./NavBar";

const socket = io('http://localhost:5000');

const ChatSystem = () => {
  const [user, setUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState({});
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      socket.emit('login', { email: parsedUser.email, role: parsedUser.role });
    }

    socket.on('login_success', (userData) => {
      console.log('Login successful:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    });

    socket.on('login_error', (error) => {
      console.error('Login error:', error);
    });

    socket.on('user_list', (users) => {
      console.log('Received user list:', users);
      setActiveUsers(users.filter(u => u.id !== user?.id));
    });

    socket.on('receive_message', (message) => {
      console.log("Received message:", message);
      setChats(prevChats => {
        const chatId = message.senderId;
        const updatedMessages = [...(prevChats[chatId]?.messages || []), message];
        return { ...prevChats, [chatId]: { ...prevChats[chatId], messages: updatedMessages } };
      });
    });

    return () => {
      socket.off('login_success');
      socket.off('login_error');
      socket.off('user_list');
      socket.off('receive_message');
    };
  }, [user]);

  const handleSend = () => {
    if (!selectedChat || messageInput.trim() === "") return;

    const newMessage = {
      receiverId: selectedChat,
      text: messageInput,
      senderId: user.id,
      senderName: user.name,
      senderEmail: user.email,
      senderRole: user.role
    };

    console.log("Sending message:", newMessage);
    socket.emit('send_message', newMessage);

    setChats(prevChats => {
      const updatedMessages = [...(prevChats[selectedChat]?.messages || []), newMessage];
      return { ...prevChats, [selectedChat]: { ...prevChats[selectedChat], messages: updatedMessages } };
    });

    setMessageInput("");
  };

  const handleChatClick = (userId) => {
    setSelectedChat(userId);
  };

  return (
    <div className="chat-system">
      <div className="chat-list">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className={`chat-list-item ${selectedChat === user.id ? "active" : ""}`}
            onClick={() => handleChatClick(user.id)}
          >
            {user.name} ({user.role})
          </div>
        ))}
      </div>
      <div className="chat-window">
        {selectedChat ? (
          <>
            <div className="chat-messages">
              {chats[selectedChat]?.messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                  <div className="chat-message-text">{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button onClick={handleSend} className="chat-send-button">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            Select a user to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
