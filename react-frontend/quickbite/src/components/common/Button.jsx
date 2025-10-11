import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant, size, fullWidth }) => ({
  borderRadius: '3px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #e55a2b 0%, #e0841a 100%)',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: '#ff6b35',
    color: '#ff6b35',
    '&:hover': {
      borderColor: '#e55a2b',
      backgroundColor: 'rgba(255, 107, 53, 0.04)',
    },
  }),
  ...(size === 'small' && {
    padding: '6px 16px',
    fontSize: '0.875rem',
  }),
  ...(size === 'medium' && {
    padding: '10px 24px',
    fontSize: '1rem',
  }),
  ...(size === 'large' && {
    padding: '14px 32px',
    fontSize: '1.125rem',
  }),
  ...(fullWidth && {
    width: '100%',
  }),
}));

const Button = ({
  children,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  color = 'primary',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      color={color}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
      endIcon={!loading ? endIcon : null}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  );
};

export default Button;
