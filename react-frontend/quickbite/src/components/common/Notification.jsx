import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../../store/slices/uiSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
