import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Box, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { closeAuthModal, openAuthModal } from '../../store/slices/uiSlice';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import ForgotPasswordForm from '../auth/ForgotPasswordForm';
import OTPVerification from '../auth/OTPVerification';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AuthModals = () => {
  const dispatch = useDispatch();
  const { authModalOpen } = useSelector((state) => state.ui);
  const { loading, error } = useSelector((state) => state.auth);
  const [tabIndex, setTabIndex] = useState(0);
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'otp'

  const handleClose = () => {
    dispatch(closeAuthModal());
    setTimeout(() => {
      setView('login');
      setTabIndex(0);
    }, 300);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setView(newValue === 0 ? 'login' : 'register');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (view) {
      case 'login':
        return <LoginForm setView={setView} />;
      case 'register':
        return <RegisterForm setView={setView} />;
      case 'forgot':
        return <ForgotPasswordForm setView={setView} />;
      case 'otp':
        return <OTPVerification setView={setView} />;
      default:
        return null;
    }
  };

  return (
    <Modal open={authModalOpen} onClose={handleClose}>
      <Box sx={style}>
        {view !== 'forgot' && view !== 'otp' && (
          <Tabs value={tabIndex} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2 }}>{renderContent()}</Box>
      </Box>
    </Modal>
  );
};

export default AuthModals;