import React, { useState } from "react";
import FarmerNav from "../FarmerNav";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, MenuItem, Select, FormHelperText } from '@mui/material';
import Lottie from 'react-lottie';
import animationData from '../../assets/Lotties/farmerregestration.json';

import styles from './FarmerRegister.module.css';



const statesList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const FarmerRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    profileImage: null,
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validateField = (name, value) => {
    let errorMsg = '';

    switch (name) {
      case 'mobileNumber':
        if (!/^\d{10}$/.test(value)) {
          errorMsg = 'Mobile number must be 10 digits';
        }
        break;
      case 'email':
        if (!/^[\w.%+-]+@gmail\.com$/.test(value)) {
          errorMsg = 'Email must be a valid Gmail address (ending with @gmail.com)';
        }
        break;
      case 'pincode':
        if (!/^\d{6}$/.test(value)) {
          errorMsg = 'Pincode must be 6 digits';
        }
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error)) {
      toast.error('Please correct the errors before submitting.');
      return;
    }

    const registrationData = new FormData();
    registrationData.append('name', formData.name);
    registrationData.append('mobileNumber', formData.mobileNumber);
    registrationData.append('email', formData.email);
    registrationData.append('address', formData.address);
    registrationData.append('city', formData.city);
    registrationData.append('state', formData.state);
    registrationData.append('pincode', formData.pincode);
    registrationData.append('password', formData.password);
    registrationData.append('img', formData.profileImage);

    try {
      const response = await axios.post('http://localhost:8080/admin/save-admin', registrationData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Registration Successful!');
      setTimeout(() => {
        navigate('/farmerlogin');
      }, 0);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div>
      <FarmerNav />
      <div className={styles.lottieContainer}>
        <Lottie options={defaultOptions} height={200} width={200} />
      </div>
      <Grid container justifyContent="center" spacing={1} style={{ marginTop: '20px' }}>
  <Grid item xs={12} sm={8} md={6} className="form-container">
    <h2>Farmer Registration</h2>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              required
              className={styles.textField}
            />
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              margin="normal"
              required
              className={styles.textField}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
              className={styles.textField}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              required
              className={styles.textField}
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              margin="normal"
              required
              className={styles.textField}
            />
            <Select
              fullWidth
              label="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              margin="normal"
              required
              className={styles.selectField}
            >
              {statesList.map((state, index) => (
                <MenuItem key={index} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.pincode}
              helperText={errors.pincode}
              margin="normal"
              required
              className="text-field"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              className="text-field"
            />
            <input
              type="file"
              name="profileImage"
              onChange={handleChange}
              required
              style={{ marginTop: '15px' }}
              className="file-input"
            />
            <FormHelperText error>{errors.form}</FormHelperText>
            <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }} className={styles.submitButton}>
              Register
            </Button>
          </form>
        </Grid>
      </Grid>
      <ToastContainer />
    </div>
  );
};

export default FarmerRegistration;
