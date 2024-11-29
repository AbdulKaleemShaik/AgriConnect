import React from 'react';
import styles from './DashBoard.module.css';
import Navbar from '../NavBar/NavBar';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {
  const navigate = useNavigate();

  const handlemsp = () => {
    navigate("/minimum-support-prize"); // Use navigate directly
  };

  return (
    <div className={styles.dashboard}>
      <Navbar />

      <div className={styles.imageContainer}>
        <img src="src/assets/farmerdashboard.png" alt="National Farmer's Day" />
      </div>

      <div className={styles.featuresSection}>
        <h2>Standout <span className={styles.featuresHighlight}>Features</span></h2>
        <div className={styles.features}>
          <div 
            className={styles.featureCard}
            onClick={handlemsp} 
          >
            <img src="/src/assets/MSP.jpg" alt="SMS System" />
            <h3>Minimum Support Price</h3>
            <p>Check the Minimum support price for your goods</p>
          </div>
          <div className={styles.featureCard}>       
            <img src="/src/assets/Images/hands.png" alt="Buyer Connection" />
            <h3>Buyer Connection</h3>
            <p>Get in direct touch with the buyer to satisfy its need</p>
          </div>
          <div className={styles.featureCard}>
            <img src="/src/assets/Images/farmerdashboard.png" alt="Farmer Group Formation" />
            <h3>Farmer Group Formation</h3>
            <p>Get in touch with other farmers, making your own community where you can ask for help</p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 AGRI CONNECT. All Rights Reserved.</p>
        <div className={styles.socialLinks}>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
      </footer>
    </div>
  );
}

export default DashBoard;
