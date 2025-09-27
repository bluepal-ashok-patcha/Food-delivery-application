import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMenuByRestaurantId } from '../Api/mockMenu';
import { addItem } from '../redux/slices/cartSlice';
import { showSnackbar } from '../redux/slices/uiSlice';
import Button from '../components/Button';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const menuData = getMenuByRestaurantId(id);
    setRestaurant(menuData);
  }, [id]);

  const handleAddToCart = (item) => {
    dispatch(addItem(item));
    dispatch(showSnackbar({ message: `${item.name} added to cart!`, severity: 'success' }));
  };

  if (!restaurant) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Restaurant Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{restaurant.name}</h1>
        <p className="text-lg text-gray-600">{restaurant.cuisine}</p>
        <div className="flex items-center mt-2">
          <span className="text-yellow-500 font-bold">{`★ ${restaurant.rating}`}</span>
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Menu</h2>
        <ul>
          {restaurant.items.map((item) => (
            <li key={item.id} className="flex justify-between items-center py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-800 font-bold mt-1">₹{item.price}</p>
              </div>
              <div>
                <Button onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RestaurantDetails;