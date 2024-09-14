import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";
import bgimg from "./images/login.jpg";
import NavBar from "./NavBar";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("refugee"); // 'refugee' or 'employee'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userName", data.name);
        if (role === "refugee") {
          console.log("Refugee logged in:", data.refugee.name);
          localStorage.setItem("refugeeName", data.refugee.name);
          navigate("/chatsystem"); // Redirect to chatsystem instead of refugeepage
        } else if (role === "employee") {
          console.log("Employee logged in:", data.employee.name);
          localStorage.setItem("employeeName", data.employee.name);
          navigate("/chatsystem"); // Redirect to chatsystem for employees as well
        }
      } else {
        console.error("Error from server:", data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    if (role === "refugee") {
      navigate("/signup-refugee");
    } else {
      navigate("/signup-worker");
    }
  };

  return (
    <div className="main">
      {/* Including NavBar component at the top */}
      <NavBar />
      
      <div className="side">
        <div className="left-container">
          <img src={bgimg} alt="Background" />
        </div>
        <div className="right-container">
          <div className="inner-right">
            <div className="options">
              <h2
                className={role === "refugee" ? "active" : ""}
                onClick={() => setRole("refugee")}
              >
                Refugee
              </h2>
              <h2
                className={role === "employee" ? "active" : ""}
                onClick={() => setRole("employee")}
              >
                Employee
              </h2>
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
                {error && <p style={{ color: "red" }}>{error}</p>}
                <a href="#" className="forgot-password">
                  Forgot Password?
                </a>
                <div className="button-container">
                  <button
                    type="submit"
                    className="btn-login"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  <button
                    type="button"
                    className="btn-signup"
                    onClick={handleSignup}
                  >
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
