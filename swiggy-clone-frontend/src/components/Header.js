import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { showSnackbar } from '../redux/slices/uiSlice';

const Header = ({ onLoginClick, onSignUpClick }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showSnackbar({ message: 'Logged out successfully.', severity: 'info' }));
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-orange-500">
          <Link to="/">SwiggyClone</Link>
        </div>

        {/* Navigation & Auth */}
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="font-semibold text-gray-700">Hi, {user?.name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="font-semibold text-gray-700 hover:text-orange-500 transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="font-semibold text-gray-700 hover:text-orange-500 transition-colors duration-300"
              >
                Login
              </button>
              <button
                onClick={onSignUpClick}
                className="px-4 py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 transition-colors duration-300"
              >
                Sign Up
              </button>
            </>
          )}

          {/* Cart Icon */}
          <Link to="/cart" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItemsInCart}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;