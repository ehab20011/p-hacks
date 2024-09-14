import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./styles/Login.css";
import bgimg from "./images/login.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('refugeeName', data.refugee.name);
        navigate('/refugeepage');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Login failed, please try again.');
    }
  };

  const handleSignupClick = () => {
    // Navigate to the signup worker page
    navigate('/signup-worker');
  };

  return (
    <div className="main">
      <h2 className="refu">RefuConnect</h2>
      <div className="side">
        <div className="left-container">
          <img src={bgimg} alt="Background" />
        </div>
        <div className="right-container">
          <div className="options">
            <h2>Login</h2>
            <h2 onClick={handleSignupClick} style={{ cursor: 'pointer' }}>Sign Up</h2>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="user-input">
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <button type="button" className="forgot-password">
                Forgot Password?
              </button>
              <button type="submit" className="btn-login">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
