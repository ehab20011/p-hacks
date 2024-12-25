import React, { useState, useEffect, useRef } from "react";
import "./styles/ChatSystem.css";
import NavBar from "./NavBar";
import Ably from "ably";

const ChatSystem = () => {
  const [user, setUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [fileInput, setFileInput] = useState(null);

  const BASE_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const ABLY_API_KEY = process.env.REACT_APP_ABLY_API_KEY;

  const ablyInstanceRef = useRef(null); // To store Ably connection
  const chatChannelRef = useRef(null); // To store the channel reference

  useEffect(() => {
    // Load user details from localStorage
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!userId || !userName || !userRole) {
      console.error("User data is missing in localStorage");
      return;
    }

    setUser({ id: userId, name: userName, role: userRole });

    // Initialize Ably connection (only once)
    if (!ablyInstanceRef.current) {
      ablyInstanceRef.current = new Ably.Realtime({ key: ABLY_API_KEY });

      ablyInstanceRef.current.connection.on("connected", () => {
        console.log("Connected to Ably Realtime");
      });

      ablyInstanceRef.current.connection.on("closed", () => {
        console.log("Ably connection closed");
      });

      ablyInstanceRef.current.connection.on("failed", (err) => {
        console.error("Ably connection failed:", err);
      });
    }

    // Initialize and attach the "chat" channel
    const channel = ablyInstanceRef.current.channels.get("chat");
    chatChannelRef.current = channel; // Save the channel reference

    // If already connected, attach now; otherwise, wait for "connected"
    if (ablyInstanceRef.current.connection.state === "connected") {
      attachAndEnterPresence(channel, { userId, userName, userRole });
    } else {
      ablyInstanceRef.current.connection.once("connected", () => {
        attachAndEnterPresence(channel, { userId, userName, userRole });
      });
    }

    // Cleanup: do not close the entire connection if we want to keep it alive
    return () => {
      console.log("Cleaning up...");
      if (chatChannelRef.current) {
        // Always unsubscribe from messages
        chatChannelRef.current.unsubscribe("message");
    
        // Only try to leave presence if the channel is still attached
        if (chatChannelRef.current.state === "attached") {
          chatChannelRef.current.presence.leave();
        }
      }
    };
  }, []);

  // Helper function to attach + subscribe to presence + subscribe to messages
  const attachAndEnterPresence = (channel, { userId, userName, userRole }) => {
    if (channel.state !== "attached") {
      channel.attach((err) => {
        if (err) {
          console.error("Error attaching to channel:", err.message);
          return;
        }
        console.log("Chat channel attached successfully");
        setupChannel(channel, { userId, userName, userRole });
      });
    } else {
      // If it's already attached for some reason, just set it up
      setupChannel(channel, { userId, userName, userRole });
    }
  };

  const setupChannel = (channel, { userId, userName, userRole }) => {
    // Subscribe to chat messages
    channel.subscribe("message", (message) => {
      handleIncomingMessage(message.data);
    });

    // *** ENTER PRESENCE with some data so we appear as "online" ***
    channel.presence.enter({ id: userId, name: userName, role: userRole });

    // Subscribe to presence events
    channel.presence.subscribe("enter", (pMsg) => {
      console.log("Presence ENTER:", pMsg);
      updateActiveUsers(channel);
    });
    channel.presence.subscribe("leave", (pMsg) => {
      console.log("Presence LEAVE:", pMsg);
      updateActiveUsers(channel);
    });
    channel.presence.subscribe("update", (pMsg) => {
      console.log("Presence UPDATE:", pMsg);
      updateActiveUsers(channel);
    });

    // Immediately load the current presence members
    updateActiveUsers(channel);
  };

  // Query current presence members, store them in `activeUsers` state
  const updateActiveUsers = (channel) => {
    channel.presence.get((err, members) => {
      if (err) {
        console.error("Error fetching presence members:", err);
        return;
      }
      // members[i].clientId OR members[i].memberKey, plus members[i].data
      // We stored: data = { id, name, role }
      const online = members.map((m) => ({
        id: m.data?.id || m.clientId, // fallback if no data
        name: m.data?.name || "Unknown",
        role: m.data?.role || "user",
      }));
      console.log("Current presence members:", online);
      setActiveUsers(online);
    });
  };

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

    fetch(`${BASE_API_URL}/api/getMessages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: user.id,
        receiverId: userId,
      }),
    })
      .then((response) => response.json())
      .then((messages) => {
        setChats((prevChats) => ({
          ...prevChats,
          [userId]: Array.isArray(messages) ? messages : [],
        }));
      })
      .catch((err) => console.error("Error fetching messages:", err));
  };

  const handleSend = async () => {
    if (!selectedChat || (messageInput.trim() === "" && !fileInput)) return;

    const newMessage = {
      senderId: user.id,
      receiverId: selectedChat,
      text: messageInput,
      file: null,
    };

    // Handle file upload
    if (fileInput) {
      const reader = new FileReader();
      reader.onload = async () => {
        newMessage.file = {
          name: fileInput.name,
          type: fileInput.type,
          data: reader.result,
        };
        chatChannelRef.current.publish("message", newMessage);
        setFileInput(null);
      };
      reader.readAsDataURL(fileInput);
    } else {
      chatChannelRef.current.publish("message", newMessage);
    }

    setChats((prevChats) => ({
      ...prevChats,
      [selectedChat]: [...(prevChats[selectedChat] || []), newMessage],
    }));
    setMessageInput("");
  };

  const handleLogout = () => {
    // On logout, you can finally close the connection
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    if (ablyInstanceRef.current) ablyInstanceRef.current.connection.close();
    window.location.href = "/login";
  };

  // We'll need a file-input onChange handler:
  const handleFileChange = (e) => {
    setFileInput(e.target.files[0] || null);
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
            {activeUsers.map((u) => (
              <div
                key={u.id}
                className={`user-item ${selectedChat === u.id ? "active" : ""}`}
                onClick={() => handleChatClick(u.id)}
              >
                {u.name} ({u.role})
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
                      className={`chat-message ${
                        msg.senderId === user.id ? "sent" : "received"
                      }`}
                    >
                      <div className="message-sender">
                        {msg.senderId === user.id
                          ? "You"
                          : activeUsers.find((u) => u.id === msg.senderId)
                              ?.name || "Unknown"}
                      </div>
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
    </div>
  );
};

export default ChatSystem;
