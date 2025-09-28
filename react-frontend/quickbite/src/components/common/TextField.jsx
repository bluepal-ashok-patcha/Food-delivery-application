import React from 'react';
import { TextField as MuiTextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#ff6b35',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff6b35',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#666',
    '&.Mui-focused': {
      color: '#ff6b35',
    },
  },
}));

const TextField = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  required = false,
  disabled = false,
  fullWidth = false,
  multiline = false,
  rows = 1,
  startIcon,
  endIcon,
  ...props
}) => {
  return (
    <StyledTextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      type={type}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : null,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : null,
      }}
      {...props}
    />
  );
};

export default TextField;
