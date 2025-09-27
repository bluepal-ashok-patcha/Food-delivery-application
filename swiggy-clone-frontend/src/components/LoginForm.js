import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/uiSlice';
import TextField from './TextField';
import Button from './Button';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: (values, { resetForm }) => {
      // Mock login logic
      console.log('Login submitted with:', values);

      // Dispatch login success action
      dispatch(loginSuccess({ name: 'Test User', email: values.email }));

      // Show success notification
      dispatch(showSnackbar({ message: 'Login successful!', severity: 'success' }));

      // Optionally, close the modal after login
      // This would require passing the onClose handler down to this component

      resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        label="Email"
        name="email"
        type="email"
        formik={formik}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        formik={formik}
      />
      <div className="mt-6">
        <Button type="submit" fullWidth disabled={formik.isSubmitting}>
          Login
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;