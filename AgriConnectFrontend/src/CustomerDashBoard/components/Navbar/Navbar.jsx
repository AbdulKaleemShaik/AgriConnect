import React, { useContext, useState } from "react";
import styles from "./Navbarr.module.css";
import { assets } from "../../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../Context/StoreContext";
import { IconButton, Avatar } from "@mui/material";
import { useUser } from "../../../Context/UserContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("menu");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    setToken("");
    setUserDetails(null);
    navigate("/customerlogin");
  };

  // Toggle mobile menu state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle profile dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={styles.navbar}>
      <Link to="/" className={styles.navbarLogo}>
        <h2>AgriConnect</h2>
      </Link>

      
      <IconButton
        color="black"
        edge="start"
        aria-label="menu"
        onClick={toggleMobileMenu}
        className={styles.menupuku}
      >
      </IconButton>

      {/* Navbar Menu */}
      <ul className={`${styles.navbarMenu} ${isMobileMenuOpen ? styles.show : ""}`}>
        <li>
          <Link
            to="/"
            onClick={() => setMenu("home")}
            className={menu === "home" ? styles.active : ""}
          >
            Home
          </Link>
        </li>
        <li>
          <a
            href="#explore-menu"
            onClick={() => setMenu("menu")}
            className={menu === "menu" ? styles.active : ""}
          >
            Menu
          </a>
        </li>
        <li>
          <a
            href="#food-display"
            onClick={() => setMenu("food-display")}
            className={menu === "food-display" ? styles.active : ""}
          >
            Fresh Goods
          </a>
        </li>
        <li>
          <a
            href="#footer"
            onClick={() => setMenu("contact us")}
            className={menu === "contact us" ? styles.active : ""}
          >
            Contact Us
          </a>
        </li>
      </ul>

      {/* Right Section: Cart and Profile */}
      <div className={styles.navbarRight}>
        <div className={styles.navbarSearchIcon}>
          <Link to="/customerdashboard/cart">
            <img src={assets.basket_icon} alt="Basket Icon" />
          </Link>
          {getTotalCartAmount() !== 0 && userDetails && (
            <div className={styles.dot}></div>
          )}
        </div>

        <div className={styles.navbarProfile}>
          {userDetails && userDetails.profileImage ? (
            <>
              <Avatar
                className={styles.profileImage}
                src={`${import.meta.env.VITE_API_URL}/img/profile_img/${userDetails.profileImage}`}
                alt="Profile"
                onClick={toggleDropdown} // Click to toggle dropdown
              />
              {isDropdownOpen && (
                <ul className={styles.navProfileDropdown}>
                  <Link to="/customerdashboard/customer-profilepage">
                    <li>
                      <img src={assets.bag_icon} alt="Edit Profile" /> <p>Edit Profile</p>
                    </li>
                  </Link>
                  <hr />
                  <Link to="/customerdashboard/customerorders">
                    <li>
                      <img src={assets.bag_icon} alt="Orders" /> <p>Orders</p>
                    </li>
                  </Link>
                  <hr />
                  <li onClick={logout}>
                    <img src={assets.logout_icon} alt="Logout" />
                    <p>Logout</p>
                  </li>
                </ul>
              )}
            </>
          ) : (
            <div className={styles.loginsignup}>
              <Link to="/customerlogin">Login</Link>
              <Link to="/customerregestration">Register</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
