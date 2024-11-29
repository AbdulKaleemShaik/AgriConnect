import React, { useState } from 'react';
import styles from './Login.module.css';
import FarmerNav from '../FarmerNav';
import farmerImg1 from '../../assets/farmer-image2.png';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../../HomePage/NavBar';
import { loginService } from '../../Service/UserService';
import axiosInstance from '../../Service/AxiosInstant';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../Context/UserContext';


const FarmerLogin = () => {
  const navigate = useNavigate();
  const { setUserDetails } = useUser();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');


  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/admin/profiledetailsofuser');
      const userData = response.data;
      setUserDetails(userData);
      console.log(userData);

      localStorage.setItem('userDetails', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error fetching user profile');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.removeItem('token');

    const loginInfo = {
      username: phoneNumber,
      password: password,
    };

    try {
      const data = await loginService(loginInfo);
      const { token } = data;

      if (token) {

        localStorage.setItem('token', token);
        await fetchUserProfile();
        navigate('/farmerdashboard');
      } else {
        throw new Error('Token not received');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      toast.error('Invalid username or password', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className={styles.full}>
      <NavBar />
      <FarmerNav />
      <div className={styles.body}>
        <img className={styles.farmer_image} src={farmerImg1} alt="Farmer" />
        <div className={styles.login_form}>
          <div className={styles.sign_text}>
          {/* <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
            /> */}
          </div>
          {/* <div style={{ padding: '5px 30px', textAlign:'center'}}>Or</div> */}
          <form onSubmit={handleLogin}>
            <div className={styles.inputs}>
              <input
                className={styles.input}
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Link to="/forgetPassword" className={styles.forgot_password}>
                Forgot your password?
              </Link>
            </div>
            <button type="submit" className={styles.login_button} style={{ backgroundColor: '#2abd5d' }}>
              Log In
            </button>
            <div>
              Don't Have an account?
              <Link to="/farmerregistration" style={{ color: '#2abd5d' }}>
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FarmerLogin;
