import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Grid, Link, Paper } from '@mui/material';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordService } from '../Service/UserService';
import { getErrorMessage } from '../Service/AxiosInstant';
import { styled } from '@mui/system';
import Lottie from 'react-lottie';
import animationData from '../assets/Lotties/forgetpassword.json';
import Loading from './SendinMail';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StyledPaper = styled(Paper)({
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#f9f9f9',
});

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // The server answers the same way whether or not the email is registered
      await forgotPasswordService(email.trim());
      toast.success('If an account exists for this email, a 6-digit code has been sent.');
      navigate(`/resetPassword/${encodeURIComponent(email.trim())}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Something went wrong. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };


  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <StyledPaper elevation={3}>
        <Box textAlign="center" mb={3}>
          <Lottie options={defaultOptions} height={150} width={150} />
          <Typography variant="h4" component="h1" gutterBottom>
            Forgot Password?
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            "Lost Password? Harvest your access faster than a bumper crop!"
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <Grid container alignItems="flex-end">
              <Grid item>
                <FaEnvelope size={24} style={{ marginBottom: '18px', marginRight: '8px', color: '#555' }} />
              </Grid>
              <Grid item xs>
                <TextField
                  fullWidth
                  label="Enter your email"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Box textAlign="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 5, py: 1.5, mt: 2 }}
            >
              Submit
            </Button>
          </Box>
        </form>

        <Box textAlign="center" mt={3}>
          <Link href="/customerlogin" color="primary" underline="hover">
            &larr; Back to Login
          </Link>
        </Box>
      </StyledPaper>
    </Container>
    <ToastContainer/>
    </>
  );
};

export default ForgetPassword;
