import React from 'react';
import styles from './Farmer.module.css';
import myimg4 from '../assets/Images/8-epOb1ugGfX4yjUC.png';
import { Link } from 'react-router-dom';
function Farmer() {
    return (
        <div className={styles.textWrapper}>
            <div className={styles.imageContainer}>
                <img src={myimg4} alt="Farmer" className={styles.image} />
            </div>
            <div className={styles.textContent}>
                <h1>Ready to take your farm to the next level?</h1>
                <p className={styles.text}>Write join Agriconnect today and start selling your products directly to customers</p>
                <br />
                <br />
                {/* <Link to="/customerregestration" className={styles.lastButtonGreen}>Sign Up</Link> */}

            </div>
        </div>
    );
}

export default Farmer;
