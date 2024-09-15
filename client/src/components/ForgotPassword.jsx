import React, { useState } from "react";
import "./styles/ForgotPassword.css";
import NavBar from "./NavBar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    if (email) {
      // Simulate an API call or form submission
      setMessage(
        "If an account with this email exists, a reset link will be sent."
      );
    } else {
      setMessage("Please enter your email address.");
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
