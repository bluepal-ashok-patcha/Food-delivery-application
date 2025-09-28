import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Link } from '@mui/material';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordForm = ({ setView }) => {
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting, setStatus }) => {
      // Mock API call
      setTimeout(() => {
        console.log('Password reset link sent to:', values.email);
        setSubmitting(false);
        setStatus({ success: 'If an account exists for this email, a reset link has been sent.' });
      }, 1000);
    },
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          variant="outlined"
          margin="normal"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        {formik.status && formik.status.success && (
          <Typography color="success.main" sx={{ mt: 1, mb: 1 }}>
            {formik.status.success}
          </Typography>
        )}
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Link component="button" variant="body2" onClick={() => setView('login')}>
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;