import React from 'react'
import leftArrow from '../assets/leftarrow.png';
import styles from './FarmerNav.module.css';
import { useNavigate } from 'react-router-dom';

const FarmerNav = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.nav_bar}>
            <button onClick={() =>{navigate(-1)}} className={styles.back_button}>
                <img className={styles.leftarrow} src={leftArrow}/>
            </button>
            <span className={styles.text}>Login To <span style={{color:"green"}}>Farmer</span></span>
        </div>
    )
}

export default FarmerNav