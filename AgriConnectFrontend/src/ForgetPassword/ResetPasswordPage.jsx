// import React, { useState } from 'react';
// import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // Icons for the input fields
// import styles from './ResetPasswordPage.module.css';
import React, { useState } from 'react';
import axios from 'axios';
import styles from './ResetPasswordPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';


const ResetPassword = () => {
  // const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const { email } = useParams();
  // console.log(e);
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/user/api/reset-password', {
        email,
        otp,
        newPassword
      });
      // alert(response.data);
      navigate('/customerlogin');

    } catch (error) {
      console.error('Error resetting password', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reset Password</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        /> */}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;


// import React, { useState } from 'react';
// import axios from 'axios';

// const ResetPassword = () => {
//     const [email, setEmail] = useState('');
//     const [otp, setOtp] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (newPassword !== confirmPassword) {
//             alert('Passwords do not match');
//             return;
//         }
//         try {
//             const response = await axios.post('http://localhost:8080/user/api/reset-password', {
//                 email,
//                 otp,
//                 newPassword
//             });
//             alert(response.data);
//         } catch (error) {
//             console.error('Error resetting password', error);
//         }
//     };

//     return (
//         <div>
//             <h2>Reset Password</h2>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                 />
//                 <input
//                     type="text"
//                     placeholder="Enter OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="New Password"
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="Confirm New Password"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     required
//                 />
//                 <button type="submit">Reset Password</button>
//             </form>
//         </div>
//     );
// };

// export default ResetPassword;


// const ResetPassword = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);
//   const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <h2>Forgot Password?</h2>
//         <p>"Lost Password? Harvest your access faster than a bumper crop!"</p>
//       </div>
//       <div className={styles.form}>

//         <div className={styles.inputWrapper}>
//           <FaLock className={styles.icon} />
//           <input
//             type="text"
//             placeholder="Enter OTP"
//             className={styles.input}
//           />
//         </div>
//         <div className={styles.inputWrapper}>
//           <FaLock className={styles.icon} />
//           <input
//             type={showPassword ? "text" : "password"}
//             placeholder="New Password"
//             className={styles.input}
//           />
//           <div onClick={togglePasswordVisibility} className={styles.eyeIcon}>
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </div>
//         </div>
//         <div className={styles.inputWrapper}>
//           <FaLock className={styles.icon} />
//           <input
//             type={showConfirmPassword ? "text" : "password"}
//             placeholder="Confirm Password"
//             className={styles.input}
//           />
//           <div onClick={toggleConfirmPasswordVisibility} className={styles.eyeIcon}>
//             {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//           </div>
//         </div>
//         <button className={styles.resetButton}>Reset Password</button>
//       </div>
//       <a href="/customerlogin" className={styles.backToLogin}>
//         &larr; Back to Login
//       </a>
//     </div>
//   );
// };

// export default ResetPassword;