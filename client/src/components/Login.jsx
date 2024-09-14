import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./styles/Login.css";
import bgimg from "./images/login.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New: loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setLoading(true); 
    setError(""); 
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
        if (role === "refugee") {
          console.log('Refugee logged in:', data.refugee.name);
          localStorage.setItem('refugeeName', data.refugee.name); // Store refugee name
          navigate('/refugeepage'); // Redirect to refugee page
        } else if (role === "employee") {
          console.log('Employee logged in:', data.employee.name);
          localStorage.setItem('employeeName', data.employee.name); // Store employee name
          navigate('/employeepage'); // Redirect to employee page
        }
      } else {
        console.error('Error from server:', data.message);
        setError(data.message); // Display error message from the server
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed, please try again.'); // General error message
    } finally {
      setLoading(false); // Stop loading once the request finishes
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
          <div className="inner-right">
            <div className="options">
              <h2>Login</h2>
              <h2>Sign Up</h2>
            </div>
            <div>
              <form onSubmit={handleLogin}>
                <div className="user-input">
                  <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="choose-role">
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="refugee"
                      checked={role === "refugee"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    Refugee
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="employee"
                      checked={role === "employee"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    Employee
                  </label>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error */}
                <a href="#" className="forgot-password">
                  Forgot Password?
                </a>
                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? "Logging in..." : "Login"} {/* Show loading state */}
                </button>
              </form>
            </div>
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
