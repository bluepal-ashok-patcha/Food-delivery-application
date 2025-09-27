import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, clearCart } from '../redux/slices/cartSlice';
import Button from '../components/Button';

const Cart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleIncrement = (item) => {
    dispatch(incrementQuantity(item));
  };

  const handleDecrement = (item) => {
    dispatch(decrementQuantity(item));
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-800 font-bold mt-1">₹{item.price}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <button onClick={() => handleDecrement(item)} className="px-2 py-1 border rounded">-</button>
                  <span className="px-4">{item.quantity}</span>
                  <button onClick={() => handleIncrement(item)} className="px-2 py-1 border rounded">+</button>
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
          <div className="mt-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Total: ₹{cartTotal.toFixed(2)}</h2>
            <div className="flex space-x-4">
              <Button onClick={handleClearCart} variant="secondary">Clear Cart</Button>
              <Button>Proceed to Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;