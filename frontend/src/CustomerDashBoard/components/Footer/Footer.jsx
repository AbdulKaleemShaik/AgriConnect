import React from "react";
import "./Footer.css";
import { assets } from "../../../assets/assets";
function Footer() {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          {/* <img src={assets.logo} alt="AgriConnect" /> */}
          <h3>AgriConnect</h3>
          <p>
            AgriConnect is an innovative platform designed to bridge the gap between farmers and consumers by offering a wide range of farming-related products. From fresh vegetables and fruits to essential agricultural tools, AgriConnect empowers farmers to connect directly with buyers, ensuring fair prices and high-quality produce. The platform also promotes sustainable farming practices and supports local agriculture, making it a valuable resource for both farmers and consumers alike.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+919676745715</li>
            <li>contact@agriconnect.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 © 2024 BiteBuddy.com - All Right Reseved.
      </p>
    </div>
  );
}

export default Footer;
