import React from 'react';
import leftArrow from '../../assets/leftarrow.png';
import styles from './CustomerNav.module.css';
import { useNavigate } from 'react-router-dom';

const CustomerNav = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.nav_bar}>
            <button onClick={() => navigate(-1)} className={styles.back_button}>
                <img className={styles.leftarrow} src={leftArrow} alt="Back" />
                <span className={styles.back_text}>Back</span>
            </button>
        </div>
    );
};

export default CustomerNav;
