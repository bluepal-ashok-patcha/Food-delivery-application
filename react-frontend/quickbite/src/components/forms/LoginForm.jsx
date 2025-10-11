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
    .matches(/\.com$/, 'Email must end with .com')
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
      // Normalize email to lowercase before submission
      const normalizedValues = {
        ...values,
        email: values.email.toLowerCase().trim()
      };
      dispatch(loginUser(normalizedValues));
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
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', px: 1 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fc8019', mb: 1 }}>
          Login
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
          Welcome back! Please sign in to your account
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter your email"
          sx={{ 
            mb: 0,
            '& .MuiOutlinedInput-root': {
              height: '48px',
              fontSize: '14px'
            }
          }}
        />
        {formik.touched.email && formik.errors.email && (
          <Typography variant="body2" sx={{ color: '#ff6b35', mt: 0.5, fontSize: '12px', fontWeight: 500 }}>
            {formik.errors.email}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter your password"
          sx={{ 
            mb: 0,
            '& .MuiOutlinedInput-root': {
              height: '48px',
              fontSize: '14px'
            }
          }}
        />
        {formik.touched.password && formik.errors.password && (
          <Typography variant="body2" sx={{ color: '#ff6b35', mt: 0.5, fontSize: '12px', fontWeight: 500 }}>
            {formik.errors.password}
          </Typography>
        )}
      </Box>
      
      {error && (
        <Box sx={{ 
          backgroundColor: '#ffebee', 
          border: '1px solid #ffcdd2', 
          borderRadius: '3px', 
          p: 1.5, 
          mb: 2,
          textAlign: 'center' 
        }}>
          <Typography variant="body2" sx={{ color: '#d32f2f', fontSize: '13px', fontWeight: 500 }}>
            {error}
          </Typography>
        </Box>
      )}
      
      <Button
        type="submit"
        fullWidth
        loading={loading}
        size="large"
        sx={{ 
          mb: 2, 
          height: '48px',
          fontSize: '16px',
          fontWeight: 600,
          background: 'linear-gradient(135deg, #fc8019 0%, #ff6b35 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #e6730a 0%, #e55a2b 100%)',
          }
        }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
      
      <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={handleSwitchToRegister}
            sx={{ 
              textDecoration: 'none', 
              fontWeight: 600, 
              color: '#fc8019',
              fontSize: '14px',
              '&:hover': {
                color: '#e6730a',
                textDecoration: 'underline'
              }
            }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
