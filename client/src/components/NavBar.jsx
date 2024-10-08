import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./styles/NavBar.css";

const NavBar = () => {
  const location = useLocation(); 

  useEffect(() => {
    if (!window.googleTranslateScriptAdded) {
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      window.googleTranslateScriptAdded = true;
    }
  }, []);

  const scrollToAbout = () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <nav className="navbar-links left">
        </nav>
        <div className="navbar-logo">
          <a href="/" className="navbar-brand">
            RefuConnect
          </a>
        </div>
        <nav className="navbar-links right">
          <div className="navbar-language">
            <div id="google_translate_element"></div>
          </div>
          {location.pathname === "/login" && (
            <button className="scroll-about-btn" onClick={scrollToAbout}>
              About Us
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
