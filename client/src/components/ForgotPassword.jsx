import React, { useState } from "react";
import "./styles/ForgotPassword.css";
import NavBar from "./NavBar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const BASE_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("If an account with this email exists, a reset link will be sent.");
      } else {
        setMessage(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to send reset link. Please try again later.");
    }
  };


  return (
    <div>
      <NavBar />
      <div className="container">
        <h2>Forgot Password?</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="emailadd" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit">Send Reset Link</button>
          </div>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
