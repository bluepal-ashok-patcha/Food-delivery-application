import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { closeLoginModal, openRegisterModal } from '../../store/slices/uiSlice';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, userRole } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(closeLoginModal());
      const normalized = (userRole || '').toLowerCase();
      const roleToPath = {
        admin: '/admin',
        restaurant_owner: '/restaurant-owner',
        delivery_partner: '/delivery',
      };
      navigate(roleToPath[normalized] || '/');
    }
  }, [isAuthenticated, userRole, dispatch, navigate]);

  const handleSwitchToRegister = () => {
    dispatch(closeLoginModal());
    dispatch(openRegisterModal());
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Welcome Back
      </Typography>
      
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        sx={{ mb: 2 }}
      />
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      
      <Button
        type="submit"
        fullWidth
        loading={loading}
        sx={{ mb: 2 }}
      >
        Sign In
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={handleSwitchToRegister}
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
