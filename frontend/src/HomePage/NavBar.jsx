import React, { useState } from 'react';
import styles from './NavBar.module.css';
import { Link } from 'react-router-dom';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.head}>
            <div className={styles.left}>
                <Link to="/" className={styles.logo}>AgriConnect</Link>
            </div>
            <div className={styles.hamburger} onClick={toggleMenu}>
                {/* Hamburger Icon */}
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
            </div>
            <div className={`${styles.right} ${isOpen ? styles.showMenu : ''}`}>
                <Link to="/" className={styles.space}>Home</Link>
                <a href="#working" className={styles.space}>How We Work</a>
                <a href="#agriconnect" className={styles.space}>Why Agri Connect</a>
                <a href="#footer" className={styles.space}>Connect with us</a>
                <Link to="/customerregestration" className={`${styles.button} ${styles.buttonGreenbutton}`}>Sign Up</Link>
                <Link to="/customerlogin" className={`${styles.button} ${styles.buttonGreybutton}`}>Log In</Link>
            </div>
        </div>
    );
}

export default NavBar;
