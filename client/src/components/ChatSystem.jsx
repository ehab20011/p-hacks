import React, { useState, useEffect, useRef } from "react";
import "./styles/ChatSystem.css";
import NavBar from "./NavBar";

const ChatSystem = () => {
  const [user, setUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [fileInput, setFileInput] = useState(null); // Added state for file input
  const socketRef = useRef(null);

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    setUser({ id: userId, name: userName, role: userRole });

    socketRef.current = new WebSocket('ws://localhost:5000');

    socketRef.current.onopen = () => {
      console.log('Connected to WebSocket');
      socketRef.current.send(JSON.stringify({
        type: 'login',
        payload: { id: userId, name: userName, role: userRole }
      }));
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case 'active_users':
          setActiveUsers(message.payload.filter(u => u.id !== userId));
          break;
        case 'new_message':
          handleIncomingMessage(message.payload);
          break;
      }
    };

    socketRef.current.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const handleIncomingMessage = (message) => {
    setChats(prevChats => {
      const chatId = message.senderId;
      const updatedChat = prevChats[chatId] ? [...prevChats[chatId], message] : [message];
      return { ...prevChats, [chatId]: updatedChat };
    });
  };

  const handleChatClick = (userId) => {
    setSelectedChat(userId);
  };

  const handleFileChange = (e) => {
    setFileInput(e.target.files[0]);
  };

  const handleSend = () => {
    if (!selectedChat || (messageInput.trim() === "" && !fileInput)) return;

    const newMessage = {
      type: 'send_message',
      payload: {
        receiverId: selectedChat,
        text: messageInput,
        senderId: user.id,
      }
    };

    if (fileInput) {
      const reader = new FileReader();
      reader.onload = () => {
        newMessage.payload.file = {
          name: fileInput.name,
          type: fileInput.type,
          data: reader.result, // Base64 encoded file
        };
        socketRef.current.send(JSON.stringify(newMessage));
        handleIncomingMessage({ ...newMessage.payload, senderId: user.id });
        setFileInput(null); // Reset file input after sending
      };
      reader.readAsDataURL(fileInput); // Convert file to Base64 for sending
    } else {
      socketRef.current.send(JSON.stringify(newMessage));
      handleIncomingMessage({ ...newMessage.payload, senderId: user.id });
    }

    setMessageInput("");
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
                {chats[selectedChat]?.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                    <div className="message-sender">{msg.senderId === user.id ? 'You' : activeUsers.find(u => u.id === msg.senderId)?.name}</div>
                    <div className="message-text">{msg.text}</div>
                    {msg.file && (
                      <div className="message-file">
                        <a href={msg.file.data} download={msg.file.name}>
                          {msg.file.name}
                        </a>
                      </div>
                    )}
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
                
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  className="chat-file-input-hidden"
                />
                <label htmlFor="fileInput" className="chat-file-input-label">
                  <i className="fas fa-paperclip"></i>
                </label>

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
