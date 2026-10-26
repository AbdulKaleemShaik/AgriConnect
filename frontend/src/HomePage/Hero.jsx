import React from 'react';
import styles from './Hero.module.css';
import { Link } from 'react-router-dom';

function Hero() {
    return (
        <div className={styles.start}>
            <h1 className={styles.wel}>Welcome to AgriConnect</h1>
            <p id ="jj">The digital marketplace for the agriculture industry</p>
            <Link to="/farmerlogin" className={`${styles.button} ${styles.buttonGreen} ${styles.side}`}>I'm a Farmer</Link>
            <Link to="/customerlogin" className={`${styles.button} ${styles.buttonGrey}`}>I'm a Buyer</Link>
        </div>
    );
}

export default Hero;
