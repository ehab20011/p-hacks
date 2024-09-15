import React, { useState, useEffect, useRef } from "react";
import "./styles/ChatSystem.css";
import NavBar from "./NavBar";

const ChatSystem = () => {
  const [user, setUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId"); // Ensure this is defined

    if (userId && userName && userRole) {
      setUser({ id: userId, name: userName, role: userRole });
    } else {
      console.error("User data is missing in localStorage");
    }

    socketRef.current = new WebSocket('ws://localhost:5000');

    socketRef.current.onopen = () => {
      console.log("Connected to WebSocket");
      socketRef.current.send(
        JSON.stringify({
          type: "login",
          payload: { id: userId, name: userName, role: userRole },
        })
      );
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      switch (message.type) {
        case "active_users":
          setActiveUsers(message.payload.filter((u) => u.id !== userId));
          break;
        case "new_message":
          handleIncomingMessage(message.payload);
          break;
      }
    };

    socketRef.current.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const handleIncomingMessage = (message) => {
    setChats((prevChats) => {
      const chatId = message.senderId;
      const updatedChat = prevChats[chatId]
        ? [...prevChats[chatId], message]
        : [message];
      return { ...prevChats, [chatId]: updatedChat };
    });
  };

  const handleChatClick = (userId) => {
    setSelectedChat(userId);

    fetch('/api/getMessages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderId: user.id,
        receiverId: userId
      })
    })
      .then(response => response.json())
      .then(messages => {
        console.log('Fetched messages:', messages); // Add this line to inspect the messages
        // Ensure that the chat history is an array (fallback to empty array if no messages)
        setChats(prevChats => ({ ...prevChats, [userId]: Array.isArray(messages) ? messages : [] }));
      })
      .catch(err => console.error('Error fetching messages:', err));
  };




  const handleFileChange = (e) => {
    setFileInput(e.target.files[0]);
  };

  const handleSend = () => {
    if (!selectedChat || (messageInput.trim() === "" && !fileInput)) return;

    if (!user || !user.id) {
      console.error("User is not defined");
      return;
    }

    const newMessage = {
      type: "send_message",
      payload: {
        receiverId: selectedChat,
        text: messageInput,
        senderId: user.id, // Make sure user.id is defined here
      }
    };

    setChats((prevChats) => {
      const updatedChat = prevChats[selectedChat]
        ? [...prevChats[selectedChat], newMessage.payload]
        : [newMessage.payload];
      return { ...prevChats, [selectedChat]: updatedChat };
    });

    if (fileInput) {
      const reader = new FileReader();
      reader.onload = () => {
        newMessage.payload.file = {
          name: fileInput.name,
          type: fileInput.type,
          data: reader.result,
        };

        socketRef.current.send(JSON.stringify(newMessage));

        setChats((prevChats) => {
          const updatedChat = prevChats[selectedChat]
            ? [...prevChats[selectedChat], newMessage.payload]
            : [newMessage.payload];
          return { ...prevChats, [selectedChat]: updatedChat };
        });

        setFileInput(null);
      };
      reader.readAsDataURL(fileInput);
    } else {
      socketRef.current.send(JSON.stringify(newMessage));
    }


    setMessageInput("");
  };

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    socketRef.current.close();
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="chat-system-container">
      <div className="chat-system">
        <div className="chat-container">
          <div className="active-users">
            <div className="active-users-header">
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
              <h2>Inbox</h2>
            </div>
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
                    <div
                      key={index}
                      className={`chat-message ${msg.senderId === user.id ? "sent" : "received"
                        }`}
                    >
                      <div className="message-sender">
                        {msg.senderId === user.id
                          ? "You"
                          : activeUsers.find((u) => u.id === msg.senderId)?.name}
                      </div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  ))}
                </div>
                {/*<div className="chat-messages">
                  {Array.isArray(chats[selectedChat]) && chats[selectedChat].length > 0 ? (
                    chats[selectedChat].map((msg, index) => (
                      <div
                        key={index}
                        className={`chat-message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-sender">
                          {msg.senderId === user.id ? 'You' : activeUsers.find(u => u.id === msg.senderId)?.name}
                        </div>
                        <div className="message-text">{msg.text}</div>
                      </div>
                    ))
                  ) : (
                    <div>No messages yet</div>
                  )}
                </div>*/}

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
    </div>
  );
};

export default ChatSystem;
