import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Grid, TextField, Button, MenuItem, FormHelperText } from '@mui/material';
import CustomerNav from './CustomerNav';
import { registerService } from '../../Service/UserService';
import Navbar from '../../HomePage/NavBar';

const statesList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
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
      case 'confirmPassword':
        if (value !== formData.password) {
          errorMsg = 'Passwords do not match';
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

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('mobileNumber', formData.mobileNumber);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('pincode', formData.pincode);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('img', profileImage);

    try {
      const response = await registerService(formDataToSend);

      if (response.includes('Register successfully')) {
        toast.success('Registration Successful!');
        setTimeout(() => {
          navigate('/customerlogin');
        }, 0);
      } else {
        setErrors({ form: response });
      }
    } catch (err) {
      toast.error('An error occurred during registration. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      <CustomerNav />
      <Grid container justifyContent="center" spacing={2} style={{ marginTop: '20px' }}>
        <Grid item xs={12} sm={8} md={6}>
          <h2>Customer Registration</h2>
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
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              margin="normal"
              required
            >
              {statesList.map((state, index) => (
                <MenuItem key={index} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
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
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              required
            />
            <input
              type="file"
              name="profileImage"
              onChange={handleFileChange}
              required
              style={{ marginTop: '15px' }}
            />
            <FormHelperText error>{errors.form}</FormHelperText>
            <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
              Register
            </Button>
          </form>
        </Grid>
      </Grid>
    </div>
  );
};

export default CustomerRegister;
