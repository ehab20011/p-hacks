import React from "react";
import "./styles/NavBar.css";

const NavBar = () => {
  const languages = [
    "English", "Spanish", "Mandarin", "Hindi", "Arabic", "Portuguese", "Bengali", "Russian", 
    "Japanese", "Punjabi", "German", "Javanese", "Wu", "Malay", "Telugu", "Vietnamese", 
    "Korean", "French", "Marathi", "Tamil", "Urdu", "Turkish", "Italian", "Yue (Cantonese)", 
    "Thai", "Gujarati", "Jin", "Persian", "Polish", "Pashto", "Kannada", "Xiang"
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <nav className="navbar-links left">
          <a href="#about">About</a>
        </nav>
        <div className="navbar-logo">
          <a href="/" className="navbar-brand">
            RefuConnect
          </a>
        </div>
        <nav className="navbar-links right">
          <a href="#login" className="navbar-login">
            Sign Up
          </a>
          <div className="navbar-language">
            <select>
              {languages.map((language, index) => (
                <option key={index} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
