import React, { useState } from "react";
import "./styles/ChatSystemMock.css"; // Ensure you have the correct CSS file linked

const ChatSystem = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, Bob! How are you today?", sender: "Alice", time: "09:00 AM" },
    { id: 2, text: "Hi Alice! I'm doing well, thanks for asking. How about you?", sender: "Bob", time: "09:01 AM" },
    { id: 3, text: "I'm good, just getting used to the new chat system. It looks great!", sender: "Alice", time: "09:02 AM" },
    { id: 4, text: "Yes, it's quite responsive. Have you tried sending any files yet?", sender: "Bob", time: "09:05 AM" },
    { id: 5, text: "Not yet, but I was about to share a document. Here goes.", sender: "Alice", time: "09:06 AM" },
    { id: 6, text: "Got it. This will really help streamline our communication.", sender: "Bob", time: "09:07 AM" },
    { id: 7, text: "Absolutely! And it's secure too, which is essential for us.", sender: "Alice", time: "09:10 AM" },
    { id: 8, text: "Agreed. Are you going to the team meeting later?", sender: "Bob", time: "09:12 AM" },
    { id: 9, text: "Yes, I'll be there. I'll share some insights from this chat.", sender: "Alice", time: "09:15 AM" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    const newMessage = {
      id: messages.length + 1,
      text: input,
      sender: "Alice",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="chat-system">
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.sender === "Alice" ? 'sent' : 'received'}`}>
              <div className="message-content">
                <p className="message-text">{msg.text}</p>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button onClick={handleSend} className="chat-send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
