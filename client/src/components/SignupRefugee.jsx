import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./styles/SignupRefugee.css";
import NavBar from "./NavBar";

const SignupRefugee = () => {
  // Refugee States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // Email field
  const [password, setPassword] = useState(""); // Password field
  const [age, setAge] = useState(""); // Age Field
  const [gender, setGender] = useState("");
  const [familyMembers, setFamilyMembers] = useState(""); // Number of family members
  const [camp, setCamp] = useState(""); // Encampment
  const [language, setLanguage] = useState(""); // Language
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate(); // Create navigate function

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Creating the user data object to match refugeeSchema
    const refugeeData = {
      name: firstName + " " + lastName, // Concatenate first and last name
      email,
      password,
      age: Number(age), // Convert age to number
      gender,
      familyMembers: Number(familyMembers), // Convert familyMembers to number
      encampment: camp, // Encampment field
      language,
      dateOfBirth,
      phoneNumber,
    };

    try {
      // Sending a POST request to the backend
      const response = await fetch("http://localhost:5000/api/signup/refugee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refugeeData), // Send the refugee data
      });

      const result = await response.json();
      if (response.ok) {
        alert("Refugee signed up successfully!");
        navigate("/login"); // Redirect to Login page after successful signup
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to sign up the refugee");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="signup-refugee-container">
        <h2>Refugee Signup</h2>
        <form onSubmit={handleSubmit} className="signup-worker-form">
          <div className="signup-refugee-column">
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
              <label>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="signup-worker-column">
            <div>
              <label>Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              />
            </div>
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
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignupRefugee;
