import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Avatar, Menu, MenuItem, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon from Material-UI
import styles from './Navbar.module.css';
import { useUser } from '../../Context/UserContext';
import { useMemo } from 'react';
function NavBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useUser(); // Access user details from context

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    setUserDetails(null);
    handleMenuClose();
    navigate('/farmerlogin');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <AppBar
      position="static"
      className={styles.navbar}
      sx={{ backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
    >
      <Toolbar>
        <Typography variant="h6" className={styles.logo}>
          🌳 Agri Connect
        </Typography>

        <IconButton
          edge="start"
          color="black"
          aria-label="menu"
          onClick={toggleMobileMenu} // Toggle mobile menu
          className={styles.menuIcon}
        >
          <MenuIcon />
        </IconButton>

        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileNav : ''}`}>
          <Typography
            variant="button"
            onClick={() => {
              navigate('/farmerdashboard');
              handleMobileMenuClose();
            }}
            className={styles.navLink}
          >
            Home
          </Typography>
          <Typography
            variant="button"
            onClick={() => {
              navigate('/addproduct');
              handleMobileMenuClose();
            }}
            className={styles.navLink}
          >
            Add New Product
          </Typography>
          <Typography
            variant="button"
            onClick={() => {
              navigate('/myproducts');
              handleMobileMenuClose();
            }}
            className={styles.navLink}
          >
            My Products
          </Typography>
          <Typography
            variant="button"
            onClick={() => {
              navigate('/farmerorders');
              handleMobileMenuClose();
            }}
            className={styles.navLink}
          >
            Orders
          </Typography>

          <Avatar
            alt="Profile"
            src={
              userDetails && userDetails.profileImage
                ? `${import.meta.env.VITE_API_URL}/img/profile_img/${userDetails.profileImage}`
                : '/static/images/avatar/1.jpg'
            }
            onClick={handleMenuOpen}
            sx={{ cursor: 'pointer' }}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            className={styles.dropdownMenu}
          >
            <MenuItem onClick={() => { navigate('/farmerprofile'); handleMenuClose(); }}>Profile Page</MenuItem>
            <MenuItem onClick={() => { navigate('/farmerorders'); handleMenuClose(); }}>Orders Page</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
