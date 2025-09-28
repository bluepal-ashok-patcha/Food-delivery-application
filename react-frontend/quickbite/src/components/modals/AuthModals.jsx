import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeLoginModal, closeRegisterModal } from '../../store/slices/uiSlice';
import Modal from '../common/Modal';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';

const AuthModals = () => {
  const dispatch = useDispatch();
  const { isLoginModalOpen, isRegisterModalOpen } = useSelector((state) => state.ui);

  return (
    <>
      <Modal
        open={isLoginModalOpen}
        onClose={() => dispatch(closeLoginModal())}
        title="Sign In"
        maxWidth="sm"
      >
        <LoginForm />
      </Modal>
      
      <Modal
        open={isRegisterModalOpen}
        onClose={() => dispatch(closeRegisterModal())}
        title="Sign Up"
        maxWidth="sm"
      >
        <RegisterForm />
      </Modal>
    </>
  );
};

export default AuthModals;
