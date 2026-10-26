import React from 'react';
import myimg from '../assets/Images/picture farmer  6f93e1d8-b9cd-4471-aab0-8e295858b45a.png';
import myimg2 from '../assets/Images/picture that de 8aa2803c-527a-4276-a183-3271d6592af5.png';
import myimg3 from '../assets/Images/8-YDMzyIBnPlV5dPG.png';
import styles from './Agroconnect.module.css';

const AgriConnect = () => {
    return (
        <div id ="agriconnect"className={styles.agriConnectContainer}>
            <div className={styles.agriConnectInfo}>
                <h1 style={{margin:"10px 0px"}}>Why AgriConnect?</h1>
                <p>AgriConnect is a digital marketplace that allows farmers to sell their products to buyers.</p>
                <p className={styles.marginBottom}>With AgriConnect, you can set your price, set your terms, and sell directly to customers. You can also deliver your products directly to buyers' doors.</p>
            </div>
            <div className={styles.imageContainer}>
                <Section
                    src={myimg}
                    alt="Image 1"
                    height="250px"
                    width="85%"
                    heading="Sell directly to Buyers"
                    description="Set your price, set your terms and sell directly to consumers."
                />

                <Section
                    src={myimg2}
                    alt="Image 2"
                    height="250px"
                    width="85%"
                    heading="Deliver directly to Buyers"
                    description="Deliver your products directly to the buyer's door."
                />

                <Section
                    src={myimg3}
                    alt="Image 3"
                    height="250px"
                    width="85%"
                    heading="Sell to local stores"
                    description="Sell to local stores and restaurants through AgriConnect."
                />
            </div>
        </div>
    );
};

const Section = ({ src, alt, height, width, heading, description }) => {
    return (
        <div className={styles.div1}>
            <img className={styles.sectionImage} src={src} alt={alt} height={height} width={width} />
            <h3>{heading}</h3>
            <p className={styles.description}>{description}</p>
        </div>
    );
};

export default AgriConnect;
