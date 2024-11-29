import React from 'react';
import styles from './Footer.module.css';

function Footer(){
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div className={styles.socialIcons}>
            <img 
              src="https://cdn-icons-png.flaticon.com/128/20/20837.png" 
              alt="Logo" 
              className={styles.socialIcon}
            />
            <img 
              src="https://cdn-icons-png.flaticon.com/128/733/733622.png" 
              alt="Logo" 
              className={styles.socialIcon}
            />
            <img 
              src="https://cdn-icons-png.flaticon.com/128/1384/1384031.png" 
              alt="Logo" 
              className={styles.socialIcon}
            />
            <img 
              src="https://cdn-icons-png.flaticon.com/128/733/733635.png" 
              alt="Logo" 
              className={styles.socialIcon}
            />
          </div>
          <nav>
            <ul className={styles.navList}>
              <li><a href="#" className={styles.navLink}>Home</a></li>
              <li><a href="#" className={styles.navLink}>Menu</a></li>
              <li><a href="#" className={styles.navLink}>Story</a></li>
              <li><a href="#" className={styles.navLink}>Detox</a></li>
              <li><a href="#" className={styles.navLink}>Locations</a></li>
              <li><a href="#" className={styles.navLink}>Contact</a></li>
              <li><a href="#" className={styles.navLink}>Blog</a></li>
              <li><a href="#" className={styles.navLink}>Catering</a></li>
              <li><a href="#" className={styles.navLink}>Delivery</a></li>
            </ul>
          </nav>
        </div>
        <div className={styles.fo}>
          <p className={styles.textMuted}>HEALTHY FAST-CASUAL FOOD, CRAFTED WITH ❤️ IN MINNEAPOLIS</p>
          <p className={styles.textMuted}>© AgriConnect & PRESS ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
