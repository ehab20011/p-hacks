import React from "react";
import "./styles/NavBar.css";

const NavBar = () => {
  const languages = [
    "English", "Spanish", "Mandarin", "Hindi", "Arabic", "Portuguese", "Bengali", "Russian", 
    "Japanese", "Punjabi", "German", "Javanese", "Wu", "Malay", "Telugu", "Vietnamese", 
    "Korean", "French", "Marathi", "Tamil", "Urdu", "Turkish", "Italian", "Yue (Cantonese)", 
    "Thai", "Gujarati", "Jin", "Persian", "Polish", "Pashto", "Kannada", "Xiang"
  ];

  const addCustomStyle = () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0px !important; }
    `;
    document.head.appendChild(style);
  };
  
  const loadHandler = () => {
    window.google.translate.TranslateElement({
      pageLanguage: 'en',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
    addCustomStyle();
  };
  

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
            {/* Google Translate widget placeholder */}
            <div id="google_translate_element"></div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
