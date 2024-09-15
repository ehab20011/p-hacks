import React from "react";
import "./styles/About.css";
import ehab from "./images/ehab.jpeg";
import sophia from "./images/sophia.jpeg";
import kerlyn from "./images/kerlyn.jpeg";
import zian from "./images/zian.jpeg";

const About = () => {
  return (
    <section id="about" className="about-container">
      <div className="content">
        <h2>About Us</h2>
        <p>
          As of May 26th 2024, New York City alone had over 65,600 people
          seeking asylum in encampments & shelters. Over 200,000 as well since
          just 2022. Can you imagine coming to a country you have no idea about,
          being put in a shelter or encampment where you can only rely on the
          others to help you? At <b>RefuConnect</b> our goal is to help
          refugees/asylum seekers connect & stay connected with their aids at
          the encampments they're staying in.
        </p>

        <div className="team">
          <h3>Meet Our Team</h3>

          <ul className="teamimg">
            <li>
              <a href="https://www.linkedin.com/in/ehab-abdalla-04ab411b3/" target="_blank" rel="noopener noreferrer">
                <img src={ehab} alt="Ehab Abdalla" />
              </a>
              <h4>Ehab Abdalla</h4>
              <p>Backend</p>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/sophiayau" target="_blank" rel="noopener noreferrer">
                <img src={sophia} alt="Sophia Yau" />
              </a>
              <h4>Sophia Yau</h4>
              <p>Frontend</p>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/kerlyn-difo-81059b23b/" target="_blank" rel="noopener noreferrer">
                <img src={kerlyn} alt="Kerlyn Difo" />
              </a>
              <h4>Kerlyn Difo</h4>
              <p>Backend</p>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/mohammed-zian-hassan/" target="_blank" rel="noopener noreferrer">
                <img src={zian} alt="Zian Hassan" />
              </a>

              <h4>Zian Hassan</h4>
              <p>Frontend</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
