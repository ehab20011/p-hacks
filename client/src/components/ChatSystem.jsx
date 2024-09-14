import React, { useState } from "react";
import "./styles/ChatSystem.css";
import NavBar from "./NavBar";

const ChatSystem = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([
    { id: 1, name: "John Doe", messages: [] },
    { id: 2, name: "Jane Smith", messages: [] },
  ]);
  const [messageInput, setMessageInput] = useState("");

  const handleSend = () => {
    if (!selectedChat || messageInput.trim() === "") return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, { text: messageInput, sender: "user" }],
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
    <div className="chat-system">
      <NavBar />
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
      <div className="chat-window">
        {selectedChat ? (
          <>
            <div className="chat-messages">
              {selectedChat.messages.map((msg, index) => (
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
  );
};

export default ChatSystem;
