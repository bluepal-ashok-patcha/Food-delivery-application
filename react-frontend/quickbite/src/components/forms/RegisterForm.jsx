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
    .matches(/\.com$/, 'Email must end with .com')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
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
      // Normalize email to lowercase before submission
      const normalizedUserData = {
        ...userData,
        email: userData.email.toLowerCase().trim()
      };
      dispatch(registerUser(normalizedUserData));
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
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', px: 1 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fc8019', mb: 1 }}>
          Sign Up
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
          Create your account to get started
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter your full name"
          sx={{ 
            mb: 0,
            '& .MuiOutlinedInput-root': {
              height: '48px',
              fontSize: '14px'
            }
          }}
        />
        {formik.touched.name && formik.errors.name && (
          <Typography variant="body2" sx={{ color: '#ff6b35', mt: 0.5, fontSize: '12px', fontWeight: 500 }}>
            {formik.errors.name}
          </Typography>
        )}
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
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter 10-digit phone number"
          sx={{ 
            mb: 0,
            '& .MuiOutlinedInput-root': {
              height: '48px',
              fontSize: '14px'
            }
          }}
        />
        {formik.touched.phone && formik.errors.phone && (
          <Typography variant="body2" sx={{ color: '#ff6b35', mt: 0.5, fontSize: '12px', fontWeight: 500 }}>
            {formik.errors.phone}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Create a password"
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
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Confirm your password"
          sx={{ 
            mb: 0,
            '& .MuiOutlinedInput-root': {
              height: '48px',
              fontSize: '14px'
            }
          }}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <Typography variant="body2" sx={{ color: '#ff6b35', mt: 0.5, fontSize: '12px', fontWeight: 500 }}>
            {formik.errors.confirmPassword}
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
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={handleSwitchToLogin}
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
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
