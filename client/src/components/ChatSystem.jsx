import React, { useState, useEffect } from "react";
import "./styles/ChatSystem.css";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000"); // Change the URL based on your server

const ChatSystem = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([
    { id: 1, name: "John Doe", messages: [] },
    { id: 2, name: "Jane Smith", messages: [] },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]); // For real-time messages

  useEffect(() => {
    const storedRefugeeName = localStorage.getItem("refugeeName");
    const storedEmployeeName = localStorage.getItem("employeeName");

    if (storedRefugeeName) {
      setUserName(storedRefugeeName);
      setUserRole("Refugee");
    } else if (storedEmployeeName) {
      setUserName(storedEmployeeName);
      setUserRole("Employee");
    } else {
      setUserName("Unknown User");
      setUserRole("Unknown Role");
    }

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const handleSend = () => {
    if (!selectedChat || messageInput.trim() === "") return;

    const newMessage = {
      sender: userName,
      text: messageInput,
    };

    // Emit the message to the server
    socket.emit("send_message", {
      chatId: selectedChat.id,
      ...newMessage,
    });

    // Update the chat with the new message
    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setMessageInput("");
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="chat-container">
      {/* Header with user name and role */}
      <div className="chat-header">
        <h1>{userName} - {userRole}</h1>
      </div>

      <div className="chat-body">
        {/* Chat List */}
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-list-item ${
                selectedChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => handleChatClick(chat)}
            >
              {chat.name}
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedChat ? (
            <>
              <div className="chat-messages">
                {selectedChat.messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender}`}>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                ))}
                {/* Real-time messages */}
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender}`}>
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
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
