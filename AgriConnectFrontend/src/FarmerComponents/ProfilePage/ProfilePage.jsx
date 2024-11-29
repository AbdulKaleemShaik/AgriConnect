import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Service/AxiosInstant';
import { Avatar, Box, Button, Card, Container, Grid, TextField, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../Context/UserContext';
import NavBar from '../NavBar/NavBar'
import profilePhoto from '../../assets/pic1.png';
import styles from './ProfilePage.module.css'; // Custom CSS Module

function ProfilePage() {
 
  



  const { setUserDetails } = useUser();
  const [previewImage, setPreviewImage] = useState(profilePhoto); 
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profileImage: null,
  });

  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/admin/profiledetailsofuser');
        const userData = response.data;
        setUserDetails(userData);

        setFormData({
          id: userData.id,
          name: userData.name,
          mobileNumber: userData.mobileNumber,
          email: userData.email,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          pincode: userData.pincode,
          profileImage: userData.profileImage, 
        });

        if (userData.profileImage) {
          setPreviewImage(process.env.REACT_APP_BACKEND_URL + userData.profileImage); 
        } else {
          setPreviewImage(profilePhoto); 
        }

      } catch (error) {
        // toast.error('Error fetching user profile');
      }
    };

    fetchUserProfile();
  }, [setUserDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profileImage: file,
      });
      
      // Set preview image URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordChange({
      ...passwordChange,
      [name]: value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const profileFormData = new FormData();
    profileFormData.append('id', formData.id);

    for (const key in formData) {
      if (key !== 'profileImage') {
        profileFormData.append(key, formData[key]);
      }
    }

    if (formData.profileImage) {
      profileFormData.append('img', formData.profileImage);
    }

    try {
      const response = await axiosInstance.post('/admin/update-profile', profileFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedProfileImage = response.data.profileImage;
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        profileImage: updatedProfileImage,
      }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response ? error.response.data : 'Error updating profile');
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('newPassword', passwordChange.newPassword);
      params.append('currentPassword', passwordChange.currentPassword);

      await axiosInstance.post('/admin/change-password', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response ? error.response.data : 'Error changing password');
    }
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <ToastContainer />
        <Card sx={{ p: 4 }} className={styles.card}>
          <Typography variant="h4" align="center" gutterBottom className={styles.title}>
            My Profile
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} align="center">
              <Avatar
                src={previewImage}
                alt="Profile"
                sx={{ width: 110, height: 110 }}
                className={styles.avatar}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <form onSubmit={handleProfileSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mobile Number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      component="label"
                      className={styles.uploadBtn}
                      sx={{ backgroundColor: 'red', color: '#fff' }}
                    >
                      Upload Profile Image
                      <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      className={styles.submitBtn}
                      sx={{ backgroundColor: 'red', color: '#fff' }}
                    >
                      Update Profile
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 4, mt: 5 }} className={styles.card}>
          <Typography variant="h5" align="center" gutterBottom className={styles.title}>
            Change Password
          </Typography>
          <form onSubmit={handleChangePasswordSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordChange.currentPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordChange.newPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordChange.confirmPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className={styles.submitBtn}
                  sx={{ backgroundColor: 'red', color: '#fff' }}
                >
                  Change Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Container>
    </>
  );
}

export default ProfilePage;
