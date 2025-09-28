import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { closeAuthModal } from '../../store/slices/uiSlice';

const validationSchema = Yup.object({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
});

const OTPVerification = ({ setView }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setError(null);
      // Mock API call
      setTimeout(() => {
        if (values.otp === '123456') { // Mock OTP
          console.log('OTP verified successfully');
          dispatch(closeAuthModal());
        } else {
          setError('Invalid OTP. Please try again.');
        }
        setSubmitting(false);
      }, 1000);
    },
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Verify Your Email
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        We've sent a 6-digit code to your email. Please enter it below.
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="otp"
          name="otp"
          label="6-Digit OTP"
          variant="outlined"
          margin="normal"
          value={formik.values.otp}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={(formik.touched.otp && Boolean(formik.errors.otp)) || Boolean(error)}
          helperText={(formik.touched.otp && formik.errors.otp) || (error && <Alert severity="error">{error}</Alert>)}
        />
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </Box>
  );
};

export default OTPVerification;