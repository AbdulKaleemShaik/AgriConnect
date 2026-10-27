import React, { useState } from 'react';
import styles from './ResetPasswordPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPasswordService } from '../Service/UserService';
import { getErrorMessage } from '../Service/AxiosInstant';


const ResetPassword = () => {
  const params = useParams();
  const [email, setEmail] = useState(params.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error('Please enter the 6-digit code from the email');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      toast.error('Password must be between 8 and 72 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setSubmitting(true);
      await resetPasswordService({ email: email.trim(), otp: otp.trim(), newPassword });
      toast.success('Password reset successfully. Please log in with your new password.');
      navigate('/HomeLogin');
    } catch (error) {
      console.error('Error resetting password', error);
      toast.error(getErrorMessage(error, 'Could not reset the password. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reset Password</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
        <button type="submit" className={styles.button} disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
