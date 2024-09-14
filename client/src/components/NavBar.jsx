import React from "react";
import "./styles/NavBar.css";

const NavBar = () => {
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
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
