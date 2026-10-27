import React, { useState } from 'react';
import styles from '../Authentication/Login.module.css';
import CustomerNav from './CustomerNav';
import CustomerImage from '../../assets/buyer-2.png';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../../HomePage/NavBar';
import { loginService, fetchCurrentUser } from '../../Service/UserService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../Context/UserContext';
import { clearAuth, getErrorMessage, normalizeRole } from '../../Service/AxiosInstant';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const { setUserDetails } = useUser();


  const handleLogin = async (e) => {
    e.preventDefault();
    const loginInfo = {
      email: phoneNumber.trim(),
      password: password
    };

    try {
      clearAuth();
      const data = await loginService(loginInfo);
      if (normalizeRole(data.role) !== 'CUSTOMER') {
        clearAuth();
        toast.error('This account is not a customer account. Please use the farmer login.');
        return;
      }
      const userData = await fetchCurrentUser();
      setUserDetails(userData); // StoreContext loads the cart when userDetails changes
      navigate('/customerdashboard');
    } catch (error) {
      clearAuth();
      toast.error(getErrorMessage(error, 'Invalid email or password'), {
        position: "top-right",
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
      <CustomerNav />
      <div className={styles.body}>
        <img className={styles.customerImage} src={CustomerImage} alt="Customer" />
        <div className={styles.login_form}>


          <form onSubmit={handleLogin}>
            <div className={styles.inputs}>
              <input
                className={styles.input}
                type="text"
                placeholder='Email'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="password"
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div><Link to={"/forgetPassword"} className={styles.forgot_password}>Forgot your password?</Link></div>
            <button type="submit" className={styles.login_button} style={{ backgroundColor: "orange" }}>
              Log In
            </button>
            <div>
              Don't Have an account?
              <Link to="/customerregestration" style={{ color: "orange" }}>Register</Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CustomerLogin;
