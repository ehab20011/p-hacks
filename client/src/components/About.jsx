import React from "react";
import "./styles/About.css";
import ehab from "./images/ehab.jpeg";
import sophia from "./images/sophia.jpeg";
import kerlyn from "./images/kerlyn.jpeg";
import zian from "./images/zian.jpeg";

const About = () => {
  return (
    <section className="about-container">
      <div className="content">
        <h2>About Us</h2>
        <p>
          As of May 26th 2024, New York City alone had over 65,600 people
          seeking asylum in encampments & shelters. Over 200,000 as well since
          just 2022. Can you imagine coming to a country you have no idea about,
          being put in a shelter or encampment where you can only rely on the
          others to help you? At <b>RefuConnect</b> our goal is to help
          refugees/asylum seekers connect & stay connected with their aids at
          the encampements they're staying in.
        </p>

        <div className="team">
          <h3>Meet Our Team</h3>

          <ul class="teamimg">
            <li>
              <img src={ehab} alt="Team Member 1" />
              <h4>Ehab Abdalla</h4>
              <p>Backend</p>
            </li>
            <li>
              <img src={sophia} alt="Team Member 2" />
              <h4>Sophia Yau</h4>
              <p>Frontend</p>
            </li>
            <li>
              <img src={kerlyn} alt="Team Member 3" />
              <h4>Kerlyn Difo</h4>
              <p>Backend</p>
            </li>
            <li>
              <img src={zian} alt="Team Member 3" />
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
