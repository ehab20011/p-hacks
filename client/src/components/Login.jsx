import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./styles/Login.css";
import bgimg from "./images/login.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("refugee"); // 'refugee' or 'employee'
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
        body: JSON.stringify({ email, password, role }),
      });
      
      const data = await response.json();
  
      if (response.ok) {
        // Assuming response data has the necessary user info
        localStorage.setItem('userName', data.name);
        navigate('/chatsystem'); // Navigate to chatsystem for both roles
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Login failed, please try again.');
    }
  };

  const handleSignup = () => {
    if (role === 'refugee') {
      navigate('/signup-refugee');
    } else {
      navigate('/signup-worker');
    }
  };

  return (
    <div className="main">
      <h2 className="refu">RefuConnect</h2>
      <div className="side">
        <div className="left-container">
          <img src={bgimg} alt="Background" />
        </div>
        <div className="right-container">
          <div className="inner-right">
            <div className="options">
              <h2 className={role === 'refugee' ? 'active' : ''} onClick={() => setRole('refugee')}>Refugee</h2>
              <h2 className={role === 'employee' ? 'active' : ''} onClick={() => setRole('employee')}>Employee</h2>
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
                <a href="#" className="forgot-password">
                  Forgot Password?
                </a>
                <div className="button-container">
                  <button type="submit" className="btn-login">
                    Login
                  </button>
                  <button type="button" className="btn-signup" onClick={handleSignup}>
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
