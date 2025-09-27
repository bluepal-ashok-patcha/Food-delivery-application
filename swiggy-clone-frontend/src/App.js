import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import Modal from './components/Modal';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Notifier from './components/Notifier';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleLoginModal = () => setIsLoginOpen(!isLoginOpen);
  const handleSignUpModal = () => setIsSignUpOpen(!isSignUpOpen);

  return (
    <Router>
      <Notifier />
      <div className="bg-gray-50 min-h-screen">
        <Header onLoginClick={handleLoginModal} onSignUpClick={handleSignUpModal} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/cart" element={<Cart />} />
            {/* Other routes will be added here */}
          </Routes>
        </main>
        {/* Footer will go here */}
      </div>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={handleLoginModal} title="Login">
        <LoginForm />
      </Modal>

      {/* Sign-Up Modal */}
      <Modal isOpen={isSignUpOpen} onClose={handleSignUpModal} title="Sign Up">
        <SignUpForm />
      </Modal>
    </Router>
  );
}

export default App;