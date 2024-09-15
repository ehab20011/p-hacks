import React, { useEffect } from "react";
import "./styles/NavBar.css";

const NavBar = () => {
  useEffect(() => {
    // Ensure the script is only added once
    if (!window.googleTranslateScriptAdded) {
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      window.googleTranslateScriptAdded = true;
    }
  }, []);

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
        </nav>
      </div>
    </header>
  );
};

export default NavBar;