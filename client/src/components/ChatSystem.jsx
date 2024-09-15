import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./styles/ChatSystem.css";

const socket = io('http://localhost:5000');

const ChatSystem = () => {
  const [user, setUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState({});
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (user) {
      socket.emit('login', { email: user.email, role: user.role });
    }
  
    socket.on('login_success', (userData) => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    });
  
    socket.on('login_error', (error) => {
      console.error('Login error:', error);
    });
  
    socket.on('user_list', (users) => {
      if (user?.id) {
        setActiveUsers(users.filter(u => u.id !== user.id));
      }
    });
  
    return () => {
      socket.off('login_success');
      socket.off('login_error');
      socket.off('user_list');
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
      <div className="chat-container">
        <div className="active-users">
          <h2>Active Users</h2>
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className={`user-item ${selectedChat === user.id ? "active" : ""}`}
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
                    <div className="message-sender">{msg.senderName}</div>
                    <div className="message-text">{msg.text}</div>
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
    </div>
  );
};

export default ChatSystem;

