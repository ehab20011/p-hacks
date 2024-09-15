import React, { useState } from "react";
import "./styles/SignupWorker.css";
import NavBar from "./NavBar";

const SignupWorker = () => {
  // Worker States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [camp, setCamp] = useState("");
  const [language, setLanguage] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name: firstName + " " + lastName, // Concatenate first and last name
      email,
      password,
      role: jobTitle,
      encampment: camp,
      language,
      dateOfBirth,
      gender,
      phoneNumber,
      idNumber,
    };

    try {
      const response = await fetch("http://localhost:5000/api/signup/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Worker signed up successfully!");
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to sign up the worker");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="signup-worker-container">
        <h2>Employee Signup</h2>
        <form onSubmit={handleSubmit} className="signup-worker-form">
          <div className="signup-worker-column">
            <div>
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Job Title/Role</label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              >
                <option value="">Select Job Title</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="paramedic">Paramedic</option>
                <option value="logistics-coordinator">
                  Logistics Coordinator
                </option>
                <option value="camp-manager">Camp Manager</option>
                <option value="food-distribution">
                  Food Distribution Coordinator
                </option>
                <option value="sanitation-worker">Sanitation Worker</option>
                <option value="security-personnel">Security Personnel</option>
              </select>
            </div>
          </div>

          <div className="signup-worker-column">
            <div>
              <label>Camp No.</label>
              <input
                type="text"
                value={camp}
                onChange={(e) => setCamp(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label>ID Number</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignupWorker;
