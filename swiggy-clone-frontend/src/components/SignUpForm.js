import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { registerSuccess } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/uiSlice';
import TextField from './TextField';
import Button from './Button';

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const SignUpForm = () => {
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: SignUpSchema,
    onSubmit: (values, { resetForm }) => {
      // Mock sign-up logic
      console.log('Sign-up submitted with:', values);

      // Dispatch register success action
      dispatch(registerSuccess());

      // Show success notification
      dispatch(showSnackbar({ message: 'Sign-up successful! Please log in.', severity: 'success' }));

      // Optionally, close the modal and open the login modal
      // This would require more complex state management in the App component

      resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        label="Name"
        name="name"
        formik={formik}
      />
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
      <TextField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        formik={formik}
      />
      <div className="mt-6">
        <Button type="submit" fullWidth disabled={formik.isSubmitting}>
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;