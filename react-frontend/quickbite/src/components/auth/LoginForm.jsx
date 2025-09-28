import React from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { closeAuthModal } from '../../store/slices/uiSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginForm = ({ setView }) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      dispatch(loginStart());
      // Mock API call
      setTimeout(() => {
        if (values.email === 'test@example.com' && values.password === 'password') {
          dispatch(loginSuccess({ name: 'Test User', email: values.email }));
          dispatch(closeAuthModal());
        } else {
          dispatch(loginFailure('Invalid credentials'));
        }
      }, 1000);
    },
  });

  return (
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
      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <Box sx={{ textAlign: 'right', mb: 2 }}>
        <Link component="button" variant="body2" onClick={() => setView('forgot')}>
          Forgot Password?
        </Link>
      </Box>
      <Button color="primary" variant="contained" fullWidth type="submit">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;