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
          navigate("/chatsystem"); // Redirect both to chatsystem
        } else if (role === "employee") {
          console.log("Employee logged in:", data.employee.name);
          localStorage.setItem("employeeName", data.employee.name);
          navigate("/chatsystem"); // Redirect both to chatsystem
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

  return (
    // your return JSX here
  );
}

export default Login;
