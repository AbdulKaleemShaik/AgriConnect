import React from 'react';
import styles from './CustomerProfile.module.css';
import profilePhoto from '../../public/pic1.png';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

function ProfilePage() {
  return (
    <div className={styles.container}>
      <button className={styles.backButton}>← Back</button>
      <h1 className={styles.heading}>Customer Profile</h1>
      <div className={styles.profileContainer}>
        <div className={styles.photoSection}>
          <div className={styles.imageWrapper}>
            <img src={profilePhoto} alt="Farmer" className={styles.profileImage} />
            <div className={styles.overlay}>
              <button className={styles.changePhotoButton}>Change Photo</button>
            </div>
          </div>
        </div>
        <div className={styles.detailsSection}>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Phone Number</label>
            <input type="text" id="phone" placeholder="Enter your phone number" />
          </div>
          <div className={styles.field}>
            <label htmlFor="Email">Email</label>
            <input type="Email" id="Email" placeholder="Enter your Email" />
          </div>
          <div className={styles.field}>
            <label htmlFor="address">Address</label>
            <input type="text" id="address" placeholder="Enter your address" />
          </div>
          <div className={styles.field}>
            <label htmlFor="state">State</label>
            <select id="state" className={styles.select}>
              <option value="">Select your state</option>
              {indianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="district">District</label>
            <input type="text" id="district" placeholder="Enter your district    eg:Guntur" />
          </div>
          
          <button className={styles.saveButton}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
