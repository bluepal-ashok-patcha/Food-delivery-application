import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { closeRegisterModal, openLoginModal } from '../../store/slices/uiSlice';
import Button from '../common/Button';
import TextField from '../common/TextField';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[\d\s-()]+$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, userRole } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const { confirmPassword, ...userData } = values;
      dispatch(registerUser(userData));
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(closeRegisterModal());
      const normalized = (userRole || '').toLowerCase();
      const roleToPath = {
        admin: '/admin',
        restaurant_owner: '/restaurant-owner',
        delivery_partner: '/delivery',
      };
      navigate(roleToPath[normalized] || '/');
    }
  }, [isAuthenticated, userRole, dispatch, navigate]);

  const handleSwitchToLogin = () => {
    dispatch(closeRegisterModal());
    dispatch(openLoginModal());
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Create Account
      </Typography>
      
      <TextField
        fullWidth
        label="Full Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        sx={{ mb: 2 }}
      />
      
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
        label="Phone Number"
        name="phone"
        value={formik.values.phone}
        onChange={formik.handleChange}
        error={formik.touched.phone && Boolean(formik.errors.phone)}
        helperText={formik.touched.phone && formik.errors.phone}
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
      
      <TextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
        Create Account
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={handleSwitchToLogin}
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
